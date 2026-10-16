import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  // Table de la base de données à modifier
  protected tableName = 'users'

  // Ajouter la colonne qui stockera le chemin de la photo
  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Champ facultatif : les utilisateurs peuvent ne pas avoir de photo
      table.string('avatar_path', 255).nullable()
    })
  }

  // Annuler proprement la migration si nécessaire
  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Supprimer uniquement la colonne ajoutée par cette migration
      table.dropColumn('avatar_path')
    })
  }
}
