
import { DateTime } from 'luxon'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { PasswordResetTokenSchema } from '#database/schema'
import User from '#models/user'

export default class PasswordResetToken extends PasswordResetTokenSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  declare createdAt: DateTime
  declare updatedAt: DateTime | null
}
