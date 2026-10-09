
import EmailVerificationService from '#services/email_verification_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class EmailVerificationController {
  async verify({ params, response, session }: HttpContext) {
    const verificationService = new EmailVerificationService()
    const isVerified = await verificationService.verifyToken(params.token)

    if (!isVerified) {
      session.flash(
        'error',
        'Ce lien de vérification est invalide, expiré ou déjà utilisé.'
      )

      return response.redirect().toRoute('session.create')
    }

    session.flash(
      'success',
      'Ton adresse email a été confirmée. Tu peux maintenant te connecter.'
    )

    return response.redirect().toRoute('session.create')
  }
}
