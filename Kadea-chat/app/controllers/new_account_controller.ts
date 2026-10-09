
import User from '#models/user'
import { signupValidator } from '#validators/user'
import EmailVerificationService from '#services/email_verification_service'
import EmailVerificationMailer from '#services/email_verification_mailer'
import type { HttpContext } from '@adonisjs/core/http'

export default class NewAccountController {
  async create({ view }: HttpContext) {
    return view.render('pages/auth/signup')
  }

  async store({ request, response }: HttpContext) {
    const { fullName, email, password } =
      await request.validateUsing(signupValidator)

    const user = await User.create({
      fullName,
      email,
      password,
    })

    const verificationService = new EmailVerificationService()
    const token = await verificationService.createToken(user.id)

    const verificationMailer = new EmailVerificationMailer()
    await verificationMailer.send(user, token)

    return response.redirect().toRoute('email.verification.notice')
  }
}
