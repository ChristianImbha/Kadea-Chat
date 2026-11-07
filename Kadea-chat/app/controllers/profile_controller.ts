
import cloudinary from '#services/cloudinary_service'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async show({ auth, view }: HttpContext) {
    return view.render('pages/profile', { user: auth.user! })
  }

  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const fullName = request.input('fullName')?.trim()

    if (!fullName || fullName.length > 254) {
      session.flash('error', 'Le nom est obligatoire et ne doit pas dépasser 254 caractères.')
      return response.redirect('/profile')
    }

    const avatar = request.file('avatar', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (avatar && !avatar.isValid) {
      session.flash('error', 'Photo invalide : utilisez JPG, PNG ou WebP, avec une taille maximale de 2 Mo.')
      return response.redirect('/profile')
    }

    user.fullName = fullName

    if (avatar) {
      try {
        if (!avatar.tmpPath) {
          throw new Error('Fichier temporaire introuvable.')
        }

        const result = await cloudinary.uploader.upload(avatar.tmpPath, {
          folder: 'kadea-chat/avatars',
          public_id: `user-${user.id}`,
          overwrite: true,
          resource_type: 'image',
        })

        user.avatarPath = result.secure_url
      } catch (error) {
        console.error('Erreur Cloudinary :', error)
        session.flash('error', 'La photo n’a pas pu être enregistrée. Veuillez réessayer.')
        return response.redirect('/profile')
      }
    }

    await user.save()

    session.flash('success', 'Votre profil a été mis à jour.')
    return response.redirect('/profile')
  }

  // Modifier le mot de passe de l'utilisateur connecté
  async updatePassword({ auth, request, response, session }: HttpContext) {
    const user = auth.user!

    const passwordValidator = vine.create({
      currentPassword: vine.string(),
      password: vine.string().minLength(8).maxLength(32),
      passwordConfirmation: vine.string().sameAs('password'),
    })

    const { currentPassword, password } = await request.validateUsing(passwordValidator)

    const isCurrentPasswordValid = await hash.verify(user.password, currentPassword)

    if (!isCurrentPasswordValid) {
      session.flash('error', 'Votre mot de passe actuel est incorrect.')
      return response.redirect('/profile')
    }

    user.password = password
    await user.save()

    session.flash('success', 'Votre mot de passe a été modifié avec succès.')
    return response.redirect('/profile')
  }
}
