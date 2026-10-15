
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'conversation_members'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('last_read_message_id')
        .nullable()
        .references('id')
        .inTable('messages')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('last_read_message_id')
    })
  }
}
