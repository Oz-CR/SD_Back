/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const FindGamesController = () => import('../app/controllers/find_games_controller.js')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .group(() => {
    router.post('/register', '#controllers/auth_controller.register')
    router.post('/login', '#controllers/auth_controller.login')
    router.post('/validate-token', '#controllers/auth_controller.validateToken')
  })
  .prefix('/api/auth')

router
  .group(() => {
    router.post('/logout', '#controllers/auth_controller.logout')
  })
  .prefix('/api/auth')
  .use([middleware.auth()])

router
  .group(() => {
    router.get('/partidas/disponibilad', [FindGamesController, 'getGames'])
    router.post('/createRoom', [FindGamesController, 'createGame'])
  })
  .use([middleware.auth()])
