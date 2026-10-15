

import User from '#models/user'
import Conversation from '#models/conversation'
import type { HttpContext } from '@adonisjs/core/http'
import ConversationMember from '#models/conversation_member'
import Message from '#models/message'

export default class DashboardController {
  async index({ auth, view }: HttpContext) {
    const currentUser = auth.user!

    const users = await User.query()
      .whereNot('id', currentUser.id)
      .select('id', 'fullName', 'email')
      .orderBy('fullName', 'asc')

   
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


const unreadCounts: Record<number, number> = {}

for (const conversation of conversations) {
  const membership = await ConversationMember.query()
    .where('conversationId', conversation.id)
    .where('userId', currentUser.id)
    .first()

  const lastReadMessageId = membership?.lastReadMessageId ?? 0

  const result = await Message.query()
    .where('conversationId', conversation.id)
    .where('id', '>', lastReadMessageId)
    .whereNot('userId', currentUser.id)
    .count('* as total')

  unreadCounts[conversation.id] = Number(result[0].$extras.total)
}

    return view.render('pages/dashboard', {
  users,
  conversations,
  unreadCounts,
})
  }
}

