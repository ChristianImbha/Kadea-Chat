import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import Message from './message.js'
import ConversationMember from './conversation_member.js'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string

  @column()
  declare email: string

  @column()
  declare password: string

  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>

  @hasMany(() => ConversationMember)
  declare memberships: HasMany<typeof ConversationMember>
}
