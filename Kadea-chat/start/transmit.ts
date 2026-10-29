import transmit from '@adonisjs/transmit/services/main'
import ConversationMember from '#models/conversation_member'
import type { HttpContext } from '@adonisjs/core/http'

transmit.authorize<{ id: string }>(
  'conversations/:id/messages',
  async (ctx: HttpContext, { id }) => {
    const user = ctx.auth.user

    if (!user) {
      return false
    }

    const member = await ConversationMember.query()
      .where('conversation_id', Number(id))
      .where('user_id', user.id)
      .first()

    return Boolean(member)
  }
)
