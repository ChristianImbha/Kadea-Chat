import User from '#models/user'
import Conversation from '#models/conversation'
import ConversationMember from '#models/conversation_member'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import Message from '#models/message'
import transmit from '@adonisjs/transmit/services/main'

export default class ConversationsController {
  async store({ auth, request, response, session }: HttpContext) {
    const currentUser = auth.user!

    const { userId } = request.only(['userId'])
    const targetUserId = Number(userId)

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      session.flash('error', 'Utilisateur invalide.')
      return response.redirect().back()
    }

    if (targetUserId === currentUser.id) {
      session.flash('error', 'Tu ne peux pas créer une conversation avec toi-même.')
      return response.redirect().back()
    }

    const targetUser = await User.find(targetUserId)

    if (!targetUser) {
      session.flash('error', 'Cet utilisateur n’existe pas.')
      return response.redirect().back()
    }

    const existingConversation = await Conversation.query()
      .where('type', 'private')
      .whereHas('members', (query) => {
        query.where('userId', currentUser.id)
      })
      .whereHas('members', (query) => {
        query.where('userId', targetUserId)
      })
      .first()

    if (existingConversation) {
      session.flash('success', 'Conversation déjà existante.')
      return response.redirect().toRoute('dashboard')
    }

    await db.transaction(async (trx) => {
      const conversation = await Conversation.create(
        {
          type: 'private',
          name: null,
          createdBy: currentUser.id,
        },
        { client: trx }
      )

      await ConversationMember.createMany(
        [
          {
            conversationId: conversation.id,
            userId: currentUser.id,
          },
          {
            conversationId: conversation.id,
            userId: targetUserId,
          },
        ],
        { client: trx }
      )
    })

    session.flash('success', 'Conversation privée créée.')
    return response.redirect().toRoute('dashboard')
  }

  async show({ auth, params, response, session, view }: HttpContext) {
    const currentUser = auth.user!
    const conversationId = Number(params.id)

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      session.flash('error', 'Conversation invalide.')
      return response.redirect().toRoute('dashboard')
    }

    // Charger la conversation et vérifier les droits d'accès
    const conversation = await Conversation.query()
      .where('id', conversationId)
      .whereHas('members', (query) => {
        query.where('userId', currentUser.id)
      })
      .preload('members', (query) => {
        query.preload('user')
      })
      .preload('messages', (query) => {
        query.preload('author').orderBy('id', 'asc')
      })
      .first()

    if (!conversation) {
      session.flash('error', 'Conversation introuvable ou accès non autorisé.')
      return response.redirect().toRoute('dashboard')
    }

    // Charger les utilisateurs pouvant être ajoutés au groupe
    const users = await User.query().whereNot('id', currentUser.id).orderBy('fullName', 'asc')

    const existingMemberIds = conversation.members.map((member) => member.userId)

    const availableUsers = users.filter((user) => !existingMemberIds.includes(user.id))

    // Charger toutes les conversations de l'utilisateur
    const conversations = await Conversation.query()
      .whereHas('members', (query) => {
        query.where('userId', currentUser.id)
      })
      .preload('members', (query) => {
        query.preload('user')
      })
      .preload('messages', (query) => {
        query.orderBy('createdAt', 'desc')
      })
      .orderBy('id', 'desc')

    // Marquer comme lus les messages de la conversation ouverte
    const membership = await ConversationMember.query()
      .where('conversationId', conversationId)
      .where('userId', currentUser.id)
      .firstOrFail()

    const lastMessage = await Message.query()
      .where('conversationId', conversationId)
      .orderBy('id', 'desc')
      .first()

    membership.lastReadMessageId = lastMessage?.id ?? null
    await membership.save()

    // Calculer les messages non lus pour chaque conversation
    const unreadCounts: Record<number, number> = {}

    for (const item of conversations) {
      const itemMembership = await ConversationMember.query()
        .where('conversationId', item.id)
        .where('userId', currentUser.id)
        .first()

      const lastReadMessageId = itemMembership?.lastReadMessageId ?? 0

      const result = await Message.query()
        .where('conversationId', item.id)
        .where('id', '>', lastReadMessageId)
        .whereNot('userId', currentUser.id)
        .count('* as total')

      unreadCounts[item.id] = Number(result[0].$extras.total)
    }

    return view.render('pages/conversations/show', {
      conversation,
      conversations,
      currentUserId: currentUser.id,
      users: availableUsers,
      unreadCounts,
    })
  }

  async sendMessage({ auth, params, request, response, session }: HttpContext) {
    const currentUser = auth.user!
    const conversationId = Number(params.id)

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      session.flash('error', 'Conversation invalide.')
      return response.redirect().toRoute('dashboard')
    }

    // Vérifier que l'utilisateur est membre de la conversation
    const membership = await ConversationMember.query()
      .where('conversationId', conversationId)
      .where('userId', currentUser.id)
      .first()

    if (!membership) {
      session.flash('error', 'Tu n’as pas accès à cette conversation.')
      return response.redirect().toRoute('dashboard')
    }

    // Valider le contenu du message
    const content = String(request.input('content', '')).trim()

    if (!content || content.length > 5000) {
      session.flash('error', 'Le message doit contenir entre 1 et 5000 caractères.')
      return response.redirect().toRoute('conversations.show', {
        id: conversationId,
      })
    }

    // Enregistrer le message dans PostgreSQL
    const message = await Message.create({
      content,
      userId: currentUser.id,
      conversationId,
    })

    // Charger les informations de l'auteur
    await message.load('author')

    // Diffuser le message aux membres abonnés
    transmit.broadcast(`conversations/${conversationId}/messages`, {
      id: message.id,
      content: message.content,
      userId: currentUser.id,
      conversationId,
      author: message.author.fullName,
      createdAt: message.createdAt.toISO(),
    })

    // Réponse JSON pour JavaScript
    if (request.accepts(['html', 'json']) === 'json') {
      return response.created({
        message: {
          id: message.id,
          content: message.content,
          userId: currentUser.id,
          conversationId,
          author: message.author.fullName,
          createdAt: message.createdAt.toISO(),
        },
      })
    }

    // Réponse classique pour le formulaire HTML
    session.flash('success', 'Message envoyé.')

    return response.redirect().toRoute('conversations.show', {
      id: conversationId,
    })
  }

  /* Verification acces a la conversations */
  async editMessage({ auth, params, request, response, session }: HttpContext) {
    const currentUser = auth.user!
    const conversationId = Number(params.id)
    const messageId = Number(params.messageId)
    const wantsJson = request.accepts(['html', 'json']) === 'json'

    if (
      !Number.isInteger(conversationId) ||
      conversationId <= 0 ||
      !Number.isInteger(messageId) ||
      messageId <= 0
    ) {
      if (wantsJson) {
        return response.badRequest({ error: 'Identifiants invalides.' })
      }

      session.flash('error', 'Identifiants invalides.')
      return response.redirect().toRoute('dashboard')
    }

    const membership = await ConversationMember.query()
      .where('conversationId', conversationId)
      .where('userId', currentUser.id)
      .first()

    if (!membership) {
      if (wantsJson) {
        return response.forbidden({
          error: 'Tu n’as pas accès à cette conversation.',
        })
      }

      session.flash('error', 'Tu n’as pas accès à cette conversation.')
      return response.redirect().toRoute('dashboard')
    }

    const message = await Message.query()
      .where('id', messageId)
      .where('conversationId', conversationId)
      .where('userId', currentUser.id)
      .first()

    if (!message || message.isDeleted) {
      if (wantsJson) {
        return response.notFound({
          error: 'Message introuvable ou modification non autorisée.',
        })
      }

      session.flash('error', 'Message introuvable ou modification non autorisée.')
      return response.redirect().toRoute('conversations.show', {
        id: conversationId,
      })
    }

    const content = String(request.input('content', '')).trim()

    if (!content || content.length > 5000) {
      const error = 'Le message doit contenir entre 1 et 5000 caractères.'

      if (wantsJson) {
        return response.unprocessableEntity({ error })
      }

      session.flash('error', error)
      return response.redirect().toRoute('conversations.show', {
        id: conversationId,
      })
    }

    message.content = content
    await message.save()
    await message.load('author')

    const updatedMessage = {
      id: message.id,
      content: message.content,
      userId: message.userId,
      conversationId,
      author: message.author.fullName,
      createdAt: message.createdAt.toISO(),
      isEdited: true,
      isDeleted: false,
    }

    transmit.broadcast(`conversations/${conversationId}/messages`, updatedMessage)

    if (wantsJson) {
      return response.ok({ message: updatedMessage })
    }

    session.flash('success', 'Message modifié.')
    return response.redirect().toRoute('conversations.show', {
      id: conversationId,
    })
  }
  /*prise en charge JSON de la suppression */

  async deleteMessage({ auth, params, request, response, session }: HttpContext) {
    const currentUser = auth.user!
    const conversationId = Number(params.id)
    const messageId = Number(params.messageId)
    const wantsJson = request.accepts(['html', 'json']) === 'json'

    if (
      !Number.isInteger(conversationId) ||
      conversationId <= 0 ||
      !Number.isInteger(messageId) ||
      messageId <= 0
    ) {
      if (wantsJson) {
        return response.badRequest({ error: 'Identifiants invalides.' })
      }

      session.flash('error', 'Identifiants invalides.')
      return response.redirect().toRoute('dashboard')
    }

    const membership = await ConversationMember.query()
      .where('conversationId', conversationId)
      .where('userId', currentUser.id)
      .first()

    if (!membership) {
      if (wantsJson) {
        return response.forbidden({
          error: 'Tu n’as pas accès à cette conversation.',
        })
      }

      session.flash('error', 'Tu n’as pas accès à cette conversation.')
      return response.redirect().toRoute('dashboard')
    }

    const message = await Message.query()
      .where('id', messageId)
      .where('conversationId', conversationId)
      .where('userId', currentUser.id)
      .first()

    if (!message) {
      if (wantsJson) {
        return response.notFound({
          error: 'Message introuvable ou suppression non autorisée.',
        })
      }

      session.flash('error', 'Message introuvable ou suppression non autorisée.')
      return response.redirect().toRoute('conversations.show', {
        id: conversationId,
      })
    }

    if (!message.isDeleted) {
      message.content = 'Ce message a été supprimé.'
      message.isDeleted = true
      await message.save()
      await message.load('author')

      transmit.broadcast(`conversations/${conversationId}/messages`, {
        id: message.id,
        content: message.content,
        userId: message.userId,
        conversationId,
        author: message.author.fullName,
        createdAt: message.createdAt.toISO(),
        isDeleted: true,
      })
    }

    if (wantsJson) {
      return response.ok({
        message: {
          id: message.id,
          content: message.content,
          userId: message.userId,
          conversationId,
          isDeleted: true,
        },
      })
    }

    session.flash('success', 'Message supprimé.')
    return response.redirect().toRoute('conversations.show', {
      id: conversationId,
    })
  }

  async createGroup({ auth, request, response, session }: HttpContext) {
    const currentUser = auth.user!
    const name = String(request.input('name', '')).trim()
    const rawUserIds = request.input('userIds')

    // Vérifier le nom du groupe
    if (!name || name.length > 254) {
      session.flash('error', 'Le nom du groupe doit contenir entre 1 et 254 caractères.')
      return response.redirect().back()
    }

    // Vérifier la liste des participants
    if (!Array.isArray(rawUserIds) || rawUserIds.length < 2) {
      session.flash('error', 'Sélectionne au moins deux autres participants.')
      return response.redirect().back()
    }

    const userIds = rawUserIds.map((id: unknown) => Number(id))

    if (
      userIds.some((id: number) => !Number.isInteger(id) || id <= 0) ||
      new Set(userIds).size !== userIds.length ||
      userIds.includes(currentUser.id)
    ) {
      session.flash('error', 'La liste des participants est invalide.')
      return response.redirect().back()
    }

    const users = await User.query().whereIn('id', userIds)

    if (users.length !== userIds.length) {
      session.flash('error', 'Un ou plusieurs participants sont introuvables.')
      return response.redirect().back()
    }

    // Créer le groupe et ses membres dans une seule transaction
    await db.transaction(async (trx) => {
      const conversation = await Conversation.create(
        {
          type: 'group',
          name,
          createdBy: currentUser.id,
        },
        { client: trx }
      )

      await ConversationMember.createMany(
        [
          {
            conversationId: conversation.id,
            userId: currentUser.id,
          },
          ...userIds.map((userId: number) => ({
            conversationId: conversation.id,
            userId,
          })),
        ],
        { client: trx }
      )
    })

    session.flash('success', 'Groupe créé avec succès.')
    return response.redirect().toRoute('dashboard')
  }

  async addMember({ auth, params, request, response, session }: HttpContext) {
    const currentUser = auth.user!
    const conversationId = Number(params.id)
    const userId = Number(request.input('userId'))

    if (
      !Number.isInteger(conversationId) ||
      conversationId <= 0 ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      session.flash('error', 'Identifiants invalides.')
      return response.redirect().back()
    }

    const conversation = await Conversation.find(conversationId)

    if (!conversation || conversation.type !== 'group') {
      session.flash('error', 'Groupe introuvable.')
      return response.redirect().back()
    }

    if (conversation.createdBy !== currentUser.id) {
      session.flash('error', 'Seul le créateur du groupe peut gérer ses membres.')
      return response.redirect().back()
    }

    const user = await User.find(userId)

    if (!user) {
      session.flash('error', 'Utilisateur introuvable.')
      return response.redirect().back()
    }

    const existingMember = await ConversationMember.query()
      .where('conversationId', conversationId)
      .where('userId', userId)
      .first()

    if (existingMember) {
      session.flash('error', 'Cet utilisateur est déjà membre du groupe.')
      return response.redirect().back()
    }

    await ConversationMember.create({
      conversationId,
      userId,
    })

    session.flash('success', 'Membre ajouté au groupe.')

    return response.redirect().toRoute('conversations.show', {
      id: conversationId,
    })
  }

  async removeMember({ auth, params, response, session }: HttpContext) {
    const currentUser = auth.user!
    const conversationId = Number(params.id)
    const userId = Number(params.userId)

    if (
      !Number.isInteger(conversationId) ||
      conversationId <= 0 ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      session.flash('error', 'Identifiants invalides.')
      return response.redirect().back()
    }

    const conversation = await Conversation.find(conversationId)

    if (!conversation || conversation.type !== 'group') {
      session.flash('error', 'Groupe introuvable.')
      return response.redirect().back()
    }

    if (conversation.createdBy !== currentUser.id) {
      session.flash('error', 'Seul le créateur du groupe peut gérer ses membres.')
      return response.redirect().back()
    }

    if (userId === conversation.createdBy) {
      session.flash('error', 'Le créateur ne peut pas être retiré du groupe.')
      return response.redirect().back()
    }

    const member = await ConversationMember.query()
      .where('conversationId', conversationId)
      .where('userId', userId)
      .first()

    if (!member) {
      session.flash('error', 'Ce membre ne fait pas partie du groupe.')
      return response.redirect().back()
    }

    await member.delete()

    session.flash('success', 'Membre retiré du groupe.')

    return response.redirect().toRoute('conversations.show', {
      id: conversationId,
    })
  }
}
