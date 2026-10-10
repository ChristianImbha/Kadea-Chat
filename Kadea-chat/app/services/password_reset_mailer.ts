
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import User from '#models/user'

export default class PasswordResetMailer {
  async send(user: User, token: string) {
    const resetUrl = `${env.get('APP_URL')}/password/reset/${token}`

    await mail.send((message) => {
      message
        .to(user.email)
        .subject('Réinitialisation du mot de passe - Kadea Chat')
        .htmlView('emails/reset_password', {
          user,
          resetUrl,
        })
        .text(
          `Bonjour ${user.fullName},\n\n` +
          `Réinitialise ton mot de passe en ouvrant ce lien : ${resetUrl}\n\n` +
          `Ce lien expire dans 30 minutes.`
        )
    })
  }
}
