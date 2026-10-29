import { createHash, randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'

export default class PasswordResetService {
  async createToken(userId: number) {
    // Invalider les anciens tokens non utilisés
    await PasswordResetToken.query()
      .where('user_id', userId)
      .whereNull('used_at')
      .update({ usedAt: DateTime.now() })

    // Générer un token aléatoire
    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')

    // Enregistrer uniquement le hash en base de données
    await PasswordResetToken.create({
      userId,
      tokenHash,
      expiresAt: DateTime.now().plus({ minutes: 30 }),
      usedAt: null,
    })

    // Le token brut sera envoyé par e-mail
    return token
  }

  async validateToken(token: string): Promise<boolean> {
    const tokenHash = createHash('sha256').update(token).digest('hex')

    const resetToken = await PasswordResetToken.query()
      .where('token_hash', tokenHash)
      .whereNull('used_at')
      .where('expires_at', '>', DateTime.now().toSQL())
      .first()

    return resetToken !== null
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const tokenHash = createHash('sha256').update(token).digest('hex')

    return db.transaction(async (trx) => {
      const resetToken = await PasswordResetToken.query({ client: trx })
        .where('token_hash', tokenHash)
        .forUpdate()
        .first()

      if (!resetToken) return false

      if (resetToken.usedAt || resetToken.expiresAt <= DateTime.now()) {
        return false
      }

      const user = await User.query({ client: trx }).where('id', resetToken.userId).first()

      if (!user) return false

      user.password = newPassword
      await user.save()

      resetToken.usedAt = DateTime.now()
      await resetToken.save()

      return true
    })
  }
}
