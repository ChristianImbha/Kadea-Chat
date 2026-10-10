import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import EmailVerificationToken from '#models/email_verification_token'
import Message from './message.js'
import ConversationMember from './conversation_member.js'
import PasswordResetToken from '#models/password_reset_token'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>

  @hasMany(() => ConversationMember)
  declare memberships: HasMany<typeof ConversationMember>

  @hasMany(() => EmailVerificationToken)
  declare emailVerificationTokens: HasMany<typeof EmailVerificationToken>

  @hasMany(() => PasswordResetToken)
  declare passwordResetTokens: HasMany<typeof PasswordResetToken>
}
