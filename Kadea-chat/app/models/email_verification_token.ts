import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { EmailVerificationTokenSchema } from '#database/schema'
import User from '#models/user'

export default class EmailVerificationToken extends EmailVerificationTokenSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
