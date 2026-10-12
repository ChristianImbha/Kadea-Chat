
import User from '#models/user'
import Conversation from '#models/conversation'
import ConversationMember from '#models/conversation_member'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'

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
}
