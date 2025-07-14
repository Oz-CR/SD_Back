import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('room_id').unsigned().notNullable().references('id').inTable('rooms').onDelete('CASCADE')
      table.integer('winner_id').unsigned().nullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('ending_sequence').unsigned().notNullable()
      table.enum('status', ['in_game', 'finished']).defaultTo('in_game')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}