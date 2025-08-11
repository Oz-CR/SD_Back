import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rooms'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Campo JSON para almacenar los colores seleccionados
      table.json('selected_colors').nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('selected_colors')
    })
  }
}
