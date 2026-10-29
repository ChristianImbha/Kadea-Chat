import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import User from '#models/user'

export default class EmailVerificationMailer {
  async send(user: User, token: string) {
    const verifyUrl = `${env.get('APP_URL')}/email/verify/${token}`

    await mail.send((message) => {
      message
        .to(user.email)
        .subject('Confirme ton adresse email - Kadea Chat')
        .htmlView('emails/verify_email', {
          user,
          verifyUrl,
        })
        .text(
          `Bonjour ${user.fullName},\n\n` +
            `Confirme ton adresse email en cliquant sur ce lien : ${verifyUrl}\n\n` +
            `Ce lien expire dans 24 heures.`
        )
    })
  }
}
