import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rooms'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table.integer('player1_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('player2_id').unsigned().nullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('color_count').defaultTo(4).notNullable()
      table.enum('status', ['waiting', 'full', 'started', 'finished']).defaultTo('waiting')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}