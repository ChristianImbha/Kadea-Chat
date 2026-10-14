
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async show({ auth, view }: HttpContext) {
    const user = auth.user!

    return view.render('pages/profile', { user })
  }

  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const fullName = request.input('fullName')?.trim()

    if (!fullName || fullName.length > 254) {
      session.flash('error', 'Le nom est obligatoire et ne doit pas dépasser 254 caractères.')
      return response.redirect('/profile')
    }

    user.fullName = fullName
    await user.save()

    session.flash('success', 'Votre profil a été mis à jour.')
    return response.redirect('/profile')
  }
}
