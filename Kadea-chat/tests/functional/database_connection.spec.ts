
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

test('vérifie la base PostgreSQL utilisée par les tests', async ({ assert }) => {
  const result = await db.rawQuery(
    'SELECT current_database() AS database'
  )

  const database = result.rows[0]?.database

  console.log('Base PostgreSQL utilisée pour les tests :', database)

  assert.equal(database, 'Kadea_chat_dev_test')
})
