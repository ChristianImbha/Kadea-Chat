import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import Message from './message.js'
import ConversationMember from './conversation_member.js'

export default class Conversation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare isGroup: boolean

  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>

  @hasMany(() => ConversationMember)
  declare members: HasMany<typeof ConversationMember>
}