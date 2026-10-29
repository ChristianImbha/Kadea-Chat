import { createHash, randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import EmailVerificationToken from '#models/email_verification_token'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

export default class EmailVerificationService {
  async createToken(userId: number) {
    // Invalider les anciens tokens encore inutilisés
    await EmailVerificationToken.query().where('user_id', userId).whereNull('used_at').update({
      usedAt: DateTime.now(),
    })

    // Générer un token aléatoire de 32 octets
    const token = randomBytes(32).toString('hex')

    // Calculer son hash SHA-256
    const tokenHash = createHash('sha256').update(token).digest('hex')

    // Enregistrer uniquement le hash
    await EmailVerificationToken.create({
      userId,
      tokenHash,
      expiresAt: DateTime.now().plus({ hours: 1 }),
      usedAt: null,
    })

    // Le token original sera utilisé pour construire le lien email
    return token
  }

  async verifyToken(token: string): Promise<boolean> {
    const tokenHash = createHash('sha256').update(token).digest('hex')

    return db.transaction(async (trx) => {
      const verificationToken = await EmailVerificationToken.query({ client: trx })
        .where('token_hash', tokenHash)
        .forUpdate()
        .first()

      if (!verificationToken) {
        return false
      }

      if (verificationToken.usedAt || verificationToken.expiresAt <= DateTime.now()) {
        return false
      }

      const user = await User.query({ client: trx }).where('id', verificationToken.userId).first()

      if (!user || user.emailVerifiedAt) {
        return false
      }

      const now = DateTime.now()

      verificationToken.usedAt = now
      await verificationToken.save()

      user.emailVerifiedAt = now
      await user.save()

      return true
    })
  }
}
