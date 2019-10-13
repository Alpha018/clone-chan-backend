import { BaseRouter } from '../../../utils/base-router';
import { BoardController } from '../controller/board-controller';

export class BoardRoutes extends BaseRouter {

  public static path = '/api';

  configRoute() {
    /**
     * @swagger
     * /api/board:
     *   get:
     *     tags:
     *       - user
     *       - core
     *     summary: get all boards
     *     produces:
     *       - application/json
     *     consumes:
     *       - application/json
     *     parameters:
     *     responses:
     *       200:
     *         description: return access token
     *         schema:
     *           $ref: '#/definitions/User'
     *       403:
     *         description: unauthorized
     *         schema:
     *           $ref: '#/definitions/Error'
     *     security:
     *       - Bearer: []
     */
    this._router.get('/board', BoardController.getBoards);

    /**
     * @swagger
     * /api/board/slug:
     *   get:
     *     tags:
     *       - user
     *       - core
     *     summary: get board by slug
     *     produces:
     *       - application/json
     *     consumes:
     *       - application/json
     *     parameters:
     *     responses:
     *       200:
     *         description: return access token
     *         schema:
     *           $ref: '#/definitions/User'
     *       403:
     *         description: unauthorized
     *         schema:
     *           $ref: '#/definitions/Error'
     *     security:
     *       - Bearer: []
     */
    this._router.get('/board/slug', BoardController.getBoardBySlug);
  }
}
