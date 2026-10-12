
import User from '#models/user'
import Conversation from '#models/conversation'
import ConversationMember from '#models/conversation_member'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import Message from '#models/message'

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
      session.flash(
        'error',
        'Tu ne peux pas créer une conversation avec toi-même.'
      )
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
    session.flash(
      'error',
      'Conversation introuvable ou accès non autorisé.'
    )
    return response.redirect().toRoute('dashboard')
  }

  return view.render('pages/conversations/show', { conversation })
}

async sendMessage({ auth, params, request, response, session }: HttpContext) {
  const currentUser = auth.user!
  const conversationId = Number(params.id)

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    session.flash('error', 'Conversation invalide.')
    return response.redirect().toRoute('dashboard')
  }

  // Vérifier que l'utilisateur connecté est membre
  const membership = await ConversationMember.query()
    .where('conversationId', conversationId)
    .where('userId', currentUser.id)
    .first()

  if (!membership) {
    session.flash(
      'error',
      'Tu n’as pas accès à cette conversation.'
    )
    return response.redirect().toRoute('dashboard')
  }

  // Valider le contenu du message
  const content = String(request.input('content', '')).trim()

  if (!content || content.length > 5000) {
    session.flash(
      'error',
      'Le message doit contenir entre 1 et 5000 caractères.'
    )
    return response.redirect().toRoute('conversations.show', {
      id: conversationId,
    })
  }

  // Enregistrer le message dans PostgreSQL
  await Message.create({
    content,
    userId: currentUser.id,
    conversationId,
  })

  session.flash('success', 'Message envoyé.')

  return response.redirect().toRoute('conversations.show', {
    id: conversationId,
  })
}

}
