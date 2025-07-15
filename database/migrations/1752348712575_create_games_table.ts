import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('room_id').unsigned().notNullable().references('id').inTable('rooms').onDelete('CASCADE')
      table.integer('winner_id').unsigned().nullable().references('id').inTable('users').onDelete('CASCADE')
      table.text('sequence').notNullable() // JSON string of the sequence
      table.integer('current_round').defaultTo(0)
      table.integer('current_player_turn').defaultTo(1) // 1 or 2
      table.boolean('is_showing_sequence').defaultTo(false)
      table.enum('status', ['waiting', 'playing', 'finished']).defaultTo('waiting')
      table.integer('player1_score').defaultTo(0)
      table.integer('player2_score').defaultTo(0)
      table.boolean('player1_finished').defaultTo(false)
      table.boolean('player2_finished').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}