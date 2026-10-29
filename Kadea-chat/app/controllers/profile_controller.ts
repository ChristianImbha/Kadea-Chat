import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  // Afficher la page du profil avec les informations de l'utilisateur connecté
  async show({ auth, view }: HttpContext) {
    const user = auth.user!

    return view.render('pages/profile', { user })
  }

  // Modifier le nom et, si une image est envoyée, la photo de profil
  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const fullName = request.input('fullName')?.trim()

    // Vérifier que le nom est renseigné et ne dépasse pas 254 caractères
    if (!fullName || fullName.length > 254) {
      session.flash('error', 'Le nom est obligatoire et ne doit pas dépasser 254 caractères.')
      return response.redirect('/profile')
    }

    // Récupérer la photo envoyée dans le formulaire, si elle existe
    const avatar = request.file('avatar', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })
    // Vérifier si le fichier envoyé est valide
    if (avatar && !avatar.isValid) {
      session.flash(
        'error',
        'La photo doit être au format JPG, PNG ou WebP et ne pas dépasser 2 Mo.'
      )
      return response.redirect('/profile')
    }

    // Mettre à jour le nom
    user.fullName = fullName

    // Enregistrer la photo dans le dossier public/uploads
    if (avatar) {
      const fileName = `${user.id}-${Date.now()}.${avatar.extname}`

      await avatar.move('public/uploads', {
        name: fileName,
        overwrite: true,
      })

      // Enregistrer le chemin public de la photo dans la base de données
      user.avatarPath = `/uploads/${fileName}`
    }

    // Enregistrer les changements dans PostgreSQL
    await user.save()

    session.flash('success', 'Votre profil a été mis à jour.')
    return response.redirect('/profile')
  }

  // Modifier le mot de passe de l'utilisateur connecté
  async updatePassword({ auth, request, response, session }: HttpContext) {
    const user = auth.user!

    // Définir les règles de validation des champs du formulaire
    const passwordValidator = vine.create({
      currentPassword: vine.string(),
      password: vine.string().minLength(8).maxLength(32),
      passwordConfirmation: vine.string().sameAs('password'),
    })

    // Vérifier les données reçues
    const { currentPassword, password } = await request.validateUsing(passwordValidator)

    // Vérifier que l'ancien mot de passe est correct
    const isCurrentPasswordValid = await hash.verify(user.password, currentPassword)

    if (!isCurrentPasswordValid) {
      session.flash('error', 'Votre mot de passe actuel est incorrect.')
      return response.redirect('/profile')
    }

    // Enregistrer le nouveau mot de passe
    user.password = password
    await user.save()

    session.flash('success', 'Votre mot de passe a été modifié avec succès.')
    return response.redirect('/profile')
  }
}
