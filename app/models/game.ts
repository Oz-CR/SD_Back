import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Room from './room.js'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'room_id' })
  declare roomId: number

  @column({ columnName: 'winner_id' })
  declare winnerId: number | null

  @column()
  declare sequence: string

  @column({ columnName: 'current_round' })
  declare currentRound: number

  @column({ columnName: 'current_player_turn' })
  declare currentPlayerTurn: number

  @column({ columnName: 'is_showing_sequence' })
  declare isShowingSequence: boolean

  @column()
  declare status: 'waiting' | 'playing' | 'finished'

  @column({ columnName: 'player1_score' })
  declare player1Score: number

  @column({ columnName: 'player2_score' })
  declare player2Score: number

  @column({ columnName: 'player1_finished' })
  declare player1Finished: boolean

  @column({ columnName: 'player2_finished' })
  declare player2Finished: boolean

  @column({ columnName: 'player_left' })
  declare playerLeft: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Room, {
    foreignKey: 'roomId',
  })
  declare room: BelongsTo<typeof Room>

  @belongsTo(() => User, {
    foreignKey: 'winnerId',
  })
  declare winner: BelongsTo<typeof User>
}
