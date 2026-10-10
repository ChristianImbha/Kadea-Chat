
import User from '#models/user'
import PasswordResetService from '#services/password_reset_service'
import PasswordResetMailer from '#services/password_reset_mailer'
import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'

const requestResetValidator = vine.create({
  email: vine.string().trim().email().maxLength(254),
})

export default class PasswordResetsController {
  async create({ view }: HttpContext) {
    return view.render('pages/auth/forgot_password')
  }

  async store({ request, response, session }: HttpContext) {
    const { email } = await request.validateUsing(requestResetValidator)

    const user = await User.findBy('email', email)

    // Même réponse, que le compte existe ou non
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
}
