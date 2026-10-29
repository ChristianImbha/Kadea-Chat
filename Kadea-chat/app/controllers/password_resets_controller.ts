import User from '#models/user'
import PasswordResetService from '#services/password_reset_service'
import PasswordResetMailer from '#services/password_reset_mailer'
import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'

const requestResetValidator = vine.create({
  email: vine.string().trim().email().maxLength(254),
})

const resetPasswordValidator = vine.create({
  password: vine.string().minLength(8).maxLength(32),
  passwordConfirmation: vine.string().sameAs('password'),
})

export default class PasswordResetsController {
  /**
   * Afficher le formulaire de demande de réinitialisation.
   */
  async create({ view }: HttpContext) {
    return view.render('pages/auth/forgot_password')
  }

  /**
   * Envoyer un lien de réinitialisation si le compte existe.
   */
  async store({ request, response, session }: HttpContext) {
    const { email } = await request.validateUsing(requestResetValidator)
    const user = await User.findBy('email', email)

    // Ne pas révéler si l'adresse e-mail est enregistrée.
    if (user) {
      const resetService = new PasswordResetService()
      const token = await resetService.createToken(user.id)

      const resetMailer = new PasswordResetMailer()
      await resetMailer.send(user, token)
    }

    session.flash(
      'success',
      'Si un compte correspond à cette adresse, un lien de réinitialisation sera envoyé.'
    )

    return response.redirect().toRoute('password_resets.create')
  }

  /**
   * Vérifier le token avant d'afficher le formulaire.
   */
  async showResetForm({ params, view, response, session }: HttpContext) {
    const resetService = new PasswordResetService()
    const isValid = await resetService.validateToken(params.token)

    if (!isValid) {
      session.flash('error', 'Ce lien de réinitialisation est invalide ou expiré.')
      return response.redirect().toRoute('session.create')
    }

    return view.render('pages/auth/reset_password', {
      token: params.token,
    })
  }

  /**
   * Enregistrer le nouveau mot de passe.
   */
  async reset({ params, request, response, session }: HttpContext) {
    const { password } = await request.validateUsing(resetPasswordValidator)

    const resetService = new PasswordResetService()
    const success = await resetService.resetPassword(params.token, password)

    if (!success) {
      session.flash('error', 'Ce lien de réinitialisation est invalide ou expiré.')
      return response.redirect().toRoute('session.create')
    }

    session.flash('success', 'Ton mot de passe a été modifié. Tu peux maintenant te connecter.')

    return response.redirect().toRoute('session.create')
  }
}
