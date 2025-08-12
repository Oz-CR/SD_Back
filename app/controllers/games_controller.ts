import type { HttpContext } from '@adonisjs/core/http'
import Game from '#models/game'
import Room from '#models/room'
import { GameHelpers } from '#helpers/game_helpers'

export default class GamesController {
  /**
   * Obtiene el estado actual del juego
   */
  async getGameState({ params, response }: HttpContext) {
    try {
      const { roomId } = params
      
      // Buscar el juego por roomId
      let game = await Game.query()
        .where('roomId', roomId)
        .preload('room')
        .first()
      
      // Si no existe el juego, crear uno nuevo
      if (!game) {
        const room = await Room.find(roomId)
        if (!room) {
          return response.status(404).json({
            message: 'Sala no encontrada',
            error: 'ROOM_NOT_FOUND'
          })
        }
        
        // Crear estado inicial del juego
        game = await Game.create({
          roomId: parseInt(roomId),
          sequence: JSON.stringify([]),
          currentRound: 0,
          currentPlayerTurn: 1,
          isShowingSequence: false,
          status: 'waiting',
          player1Score: 0,
          player2Score: 0,
          player1Finished: false,
          player2Finished: false,
          winnerId: null
        })
        
        await game.load('room')
      }
      
      // Parsear la secuencia JSON
      let sequence = []
      try {
        sequence = JSON.parse(game.sequence || '[]')
      } catch (error) {
        console.error('Error parsing sequence:', error)
        sequence = []
      }
      
      // Asegurar que la sala esté cargada con sus datos
      if (!game.room) {
        await game.load('room')
      }
      
      // Si la sala está "started" y el juego está en "waiting", cambiar el estado del juego automáticamente
      if (game.room.status === 'started' && game.status === 'waiting' && game.currentRound === 0) {
        console.log('🔄 Sala está lista (started) pero juego en waiting - actualizando estado para auto-inicio');
        console.log('🎨 Colores disponibles para el juego:', game.room.selectedColors);
        // No cambiamos el estado aquí, el frontend lo detectará y auto-iniciará
      }
      
      const gameState = {
        id: game.id,
        roomId: game.roomId,
        sequence: sequence,
        currentRound: game.currentRound,
        currentPlayerTurn: game.currentPlayerTurn,
        isShowingSequence: game.isShowingSequence,
        status: game.status,
        player1Score: game.player1Score,
        player2Score: game.player2Score,
        player1Finished: game.player1Finished,
        player2Finished: game.player2Finished,
        winnerId: game.winnerId,
        playerLeft: game.playerLeft || null,
        gameOver: game.status === 'finished',
        room: {
          id: game.room.id,
          name: game.room.name,
          colorCount: game.room.colorCount,
          selectedColors: game.room.selectedColors,
          player1Id: game.room.player1Id,
          player2Id: game.room.player2Id,
          status: game.room.status
        }
      }
      
      return response.json({
        message: 'Estado del juego obtenido exitosamente',
        data: gameState
      })
    } catch (error) {
      console.error('Error getting game state:', error)
      return response.status(500).json({
        message: 'Error al obtener el estado del juego',
        error: error.message
      })
    }
  }
  
  /**
   * Actualiza el estado del juego
   */
  async updateGameState({ params, request, response }: HttpContext) {
    try {
      const { roomId } = params
      const updateData = request.body()
      
      console.log('Updating game state for room:', roomId, 'with data:', updateData)
      
      // Buscar el juego
      let game = await Game.query()
        .where('roomId', roomId)
        .first()
      
      // Si no existe, crear uno nuevo
      if (!game) {
        const room = await Room.find(roomId)
        if (!room) {
          return response.status(404).json({
            message: 'Sala no encontrada',
            error: 'ROOM_NOT_FOUND'
          })
        }
        
        game = await Game.create({
          roomId: parseInt(roomId),
          sequence: JSON.stringify(updateData.sequence || []),
          currentRound: updateData.currentRound || 0,
          currentPlayerTurn: updateData.currentPlayerTurn || 1,
          isShowingSequence: updateData.isShowingSequence || false,
          status: updateData.status || 'waiting',
          player1Score: updateData.player1Score || 0,
          player2Score: updateData.player2Score || 0,
          player1Finished: updateData.player1Finished || false,
          player2Finished: updateData.player2Finished || false,
          winnerId: updateData.winnerId || null
        })
      } else {
        // Actualizar campos si están presentes
        if (updateData.sequence !== undefined) {
          game.sequence = JSON.stringify(updateData.sequence)
        }
        if (updateData.currentRound !== undefined) {
          game.currentRound = updateData.currentRound
        }
        if (updateData.currentPlayerTurn !== undefined) {
          game.currentPlayerTurn = updateData.currentPlayerTurn
        }
        if (updateData.isShowingSequence !== undefined) {
          game.isShowingSequence = updateData.isShowingSequence
        }
        if (updateData.status !== undefined) {
          game.status = updateData.status
        }
        if (updateData.player1Score !== undefined) {
          game.player1Score = updateData.player1Score
        }
        if (updateData.player2Score !== undefined) {
          game.player2Score = updateData.player2Score
        }
        if (updateData.player1Finished !== undefined) {
          game.player1Finished = updateData.player1Finished
        }
        if (updateData.player2Finished !== undefined) {
          game.player2Finished = updateData.player2Finished
        }
        if (updateData.winnerId !== undefined) {
          game.winnerId = updateData.winnerId
        }
        if (updateData.playerLeft !== undefined) {
          game.playerLeft = updateData.playerLeft
        }
        
        await game.save()
        
        // Si el juego se marca como terminado, actualizar también el estado de la sala
        if (updateData.status === 'finished') {
          const room = await Room.find(game.roomId)
          if (room) {
            room.status = 'finished'
            await room.save()
            console.log('Room status updated to finished for room:', game.roomId)
          }
        }
      }
      
      // Parsear la secuencia para la respuesta
      let sequence = []
      try {
        sequence = JSON.parse(game.sequence || '[]')
      } catch (error) {
        console.error('Error parsing sequence:', error)
        sequence = []
      }
      
      const gameState = {
        id: game.id,
        roomId: game.roomId,
        sequence: sequence,
        currentRound: game.currentRound,
        currentPlayerTurn: game.currentPlayerTurn,
        isShowingSequence: game.isShowingSequence,
        status: game.status,
        player1Score: game.player1Score,
        player2Score: game.player2Score,
        player1Finished: game.player1Finished,
        player2Finished: game.player2Finished,
        winnerId: game.winnerId,
        playerLeft: game.playerLeft || null,
        gameOver: game.status === 'finished'
      }
      
      console.log('Game state updated successfully:', gameState)
      
      return response.json({
        message: 'Estado del juego actualizado exitosamente',
        data: gameState
      })
    } catch (error) {
      console.error('Error updating game state:', error)
      return response.status(500).json({
        message: 'Error al actualizar el estado del juego',
        error: error.message
      })
    }
  }
  
  /**
   * Registra un movimiento en el juego
   */
  async makeMove({ params, request, response }: HttpContext) {
    try {
      const { roomId } = params
      const moveData = request.body()
      
      console.log('Making move for room:', roomId, 'with data:', moveData)
      
      // Buscar el juego
      const game = await Game.query()
        .where('roomId', roomId)
        .first()
      
      if (!game) {
        return response.status(404).json({
          message: 'Juego no encontrado',
          error: 'GAME_NOT_FOUND'
        })
      }
      
      // Aquí podrías agregar lógica adicional para validar el movimiento
      // Por ahora, solo retornamos el estado actual
      
      let sequence = []
      try {
        sequence = JSON.parse(game.sequence || '[]')
      } catch (error) {
        console.error('Error parsing sequence:', error)
        sequence = []
      }
      
      const gameState = {
        id: game.id,
        roomId: game.roomId,
        sequence: sequence,
        currentRound: game.currentRound,
        currentPlayerTurn: game.currentPlayerTurn,
        isShowingSequence: game.isShowingSequence,
        status: game.status,
        player1Score: game.player1Score,
        player2Score: game.player2Score,
        player1Finished: game.player1Finished,
        player2Finished: game.player2Finished,
        winnerId: game.winnerId,
        gameOver: game.status === 'finished'
      }
      
      return response.json({
        message: 'Movimiento registrado exitosamente',
        data: gameState
      })
    } catch (error) {
      console.error('Error making move:', error)
      return response.status(500).json({
        message: 'Error al registrar el movimiento',
        error: error.message
      })
    }
  }
}
