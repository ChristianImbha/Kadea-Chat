import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import Message from './message.js'
import ConversationMember from './conversation_member.js'

export default class Conversation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare type: string

  @column()
  declare name: string | null

  @column()
  declare createdBy: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>

  @hasMany(() => ConversationMember)
  declare members: HasMany<typeof ConversationMember>
}
