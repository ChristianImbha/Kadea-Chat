import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('conversation_id')
        .notNullable()
        .references('id')
        .inTable('conversations')
        .onDelete('CASCADE')

      table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')

      table.text('content').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.index(['conversation_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
