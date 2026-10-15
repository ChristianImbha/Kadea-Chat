import { test } from '@japa/runner'

test('refuse l’abonnement Transmit sans authentification', async ({
  client,
}) => {
  const response = await client
    .post('/__transmit/subscribe')
    .header('Accept', 'application/json')
    .redirects(0)
    .json({
      uid: 'test-anonymous-user',
      channel: 'conversations/1/messages',
    })

  response.assertStatus(401)
})
