

import User from '#models/user'
import Conversation from '#models/conversation'
import type { HttpContext } from '@adonisjs/core/http'

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


    return view.render('pages/dashboard', {
      users,
      conversations,
    })
  }
}

