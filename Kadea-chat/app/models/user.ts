// Permet de gérer les dates et les heures
import { DateTime } from 'luxon'

// Permet de combiner plusieurs fonctionnalités dans le modèle
import { compose } from '@adonisjs/core/helpers'

// Service utilisé pour sécuriser les mots de passe
import hash from '@adonisjs/core/services/hash'

// Permet à AdonisJS de retrouver un utilisateur lors de la connexion
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

// Outils pour créer un modèle et définir ses colonnes et relations
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'

// Type utilisé pour déclarer les relations avec plusieurs enregistrements
import type { HasMany } from '@adonisjs/lucid/types/relations'

// Modèles liés à l'utilisateur
import EmailVerificationToken from '#models/email_verification_token'
import Message from './message.js'
import ConversationMember from './conversation_member.js'
import PasswordResetToken from '#models/password_reset_token'

// Configuration de la recherche d'un utilisateur lors de la connexion
// L'adresse e-mail sert à identifier le compte
// Le mot de passe est vérifié avec le système de hachage scrypt
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

// Modèle représentant un utilisateur dans la table "users"
export default class User extends compose(BaseModel, AuthFinder) {
  // Identifiant unique de l'utilisateur
  @column({ isPrimary: true })
  declare id: number

  // Nom complet de l'utilisateur
  @column()
  declare fullName: string

  // Adresse e-mail de l'utilisateur
  @column()
  declare email: string

  // Mot de passe haché de l'utilisateur
  @column()
  declare password: string

  // Date de confirmation de l'adresse e-mail
  // null signifie que l'adresse n'a pas encore été confirmée
  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  // Chemin vers la photo de profil
  // null signifie que l'utilisateur n'a pas encore de photo
  @column()
  declare avatarPath: string | null

  // Date de création du compte
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Date de la dernière modification du compte
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Messages envoyés par cet utilisateur
  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>

  // Conversations auxquelles cet utilisateur participe
  @hasMany(() => ConversationMember)
  declare memberships: HasMany<typeof ConversationMember>

  // Jetons utilisés pour confirmer son adresse e-mail
  @hasMany(() => EmailVerificationToken)
  declare emailVerificationTokens: HasMany<typeof EmailVerificationToken>

  // Jetons utilisés pour réinitialiser son mot de passe oublié
  @hasMany(() => PasswordResetToken)
  declare passwordResetTokens: HasMany<typeof PasswordResetToken>
}

