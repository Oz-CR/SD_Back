import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('player_left').nullable() // 1 o 2, indica qué jugador abandonó
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('player_left')
    })
  }
}
