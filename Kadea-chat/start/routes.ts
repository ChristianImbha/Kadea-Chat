/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'

// Page de vérification d'e-mail
router
  .on('/email/verification-notice')
  .render('pages/auth/verify_notice')
  .as('email.verification.notice')

router.on('/').render('pages/home').as('home')

// Vérification d'e-mail
router.get('/email/verify/:token', [controllers.EmailVerifications, 'verify']).as('email.verify')

// Routes accessibles aux visiteurs non connectés
router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

// Routes accessibles uniquement aux utilisateurs connectés
router
  .group(() => {
    router.get('/dashboard', [controllers.Dashboard, 'index']).as('dashboard')

    router.get('/profile', [controllers.Profile, 'show']).as('profile.show')

    router.post('/profile', [controllers.Profile, 'update']).as('profile.update')

    router
      .post('/profile/password', [controllers.Profile, 'updatePassword'])
      .as('profile.update_password')

    router.post('logout', [controllers.Session, 'destroy'])

    router.post('/conversations', [controllers.Conversations, 'store']).as('conversations.store')
    router
      .post('/conversations/:id/messages/:messageId/edit', [
        controllers.Conversations,
        'editMessage',
      ])
      .as('conversations.messages.edit')

    router.get('/conversations/:id', [controllers.Conversations, 'show']).as('conversations.show')
    router
      .post('/conversations/:id/messages', [controllers.Conversations, 'sendMessage'])
      .as('conversations.messages.store')

    router
      .post('/conversations/groups', [controllers.Conversations, 'createGroup'])
      .as('conversations.groups.store')

    router
      .post('/conversations/:id/messages/:messageId/delete', [
        controllers.Conversations,
        'deleteMessage',
      ])
      .as('conversations.messages.delete')

    router
      .post('/conversations/:id/members', [controllers.Conversations, 'addMember'])
      .as('conversations.members.add')

    router
      .post('/conversations/:id/members/:userId/remove', [
        controllers.Conversations,
        'removeMember',
      ])
      .as('conversations.members.remove')
  })

   //suppression conversation
 
    router
      .post('/conversations/:id/delete', [controllers.Conversations, 'deleteConversation'])
      .as('conversations.delete')
  
      .use(middleware.auth())
    

// Réinitialisation du mot de passe
router.get('/password/forgot', [controllers.PasswordResets, 'create']).as('password_resets.create')

router.post('/password/forgot', [controllers.PasswordResets, 'store']).as('password_resets.store')

router
  .get('/password/reset/:token', [controllers.PasswordResets, 'showResetForm'])
  .as('password_resets.show_reset_form')

router
  .post('/password/reset/:token', [controllers.PasswordResets, 'reset'])
  .as('password_resets.reset')

transmit.registerRoutes((route) => {
  route.use(middleware.auth())
})
