import API, { GET, PUT, POST, DELETE, authenticated, required, getJSONAPIData, PATCH } from '../classes/API'
import { websocket } from '../classes/WebSocket'
import Anope from '../classes/Anope'
import AnopeQuery from '../query/AnopeQuery'
import ObjectDocument from '../Documents/ObjectDocument'
import { NicknameView, UserView } from '../view'
import { BadRequestAPIError, ConflictAPIError, NotFoundAPIError } from '../classes/APIError'
import { DocumentViewType } from '../Documents/Document'
import StatusCode from '../classes/StatusCode'
import { User, Rat } from '../db'
import DatabaseQuery from '../query/DatabaseQuery'
import DatabaseDocument from '../Documents/DatabaseDocument'

export default class Nickname extends API {
  get type () {
    return 'nicknames'
  }

  @GET('/nicknames')
  @websocket('nicknames', 'search')
  @authenticated
  async search (ctx) {
    const { nick } = ctx.query
    const result = await Anope.findAccountFuzzyMatch(nick)
    const query = new AnopeQuery({ connection: ctx })
    return new ObjectDocument({ query, result, type: NicknameView })
  }

  @GET('/nicknames/:nick')
  @websocket('nicknames', 'read')
  @authenticated
  async findById (ctx) {
    const { nick } = ctx.params
    const result = await Anope.findNickname(nick)
    if (!result) {
      throw new NotFoundAPIError({ parameter: 'id' })
    }
    const query = new AnopeQuery({ connection: ctx })
    return new ObjectDocument({ query, result, type: NicknameView, view: DocumentViewType.individual })
  }

  @POST('/nicknames')
  @websocket('nicknames', 'create')
  @authenticated
  async create (ctx) {
    const { nick, ratId } = getJSONAPIData({ ctx, type: this.type })
    const existingNick = Anope.findNickname(nick)
    if (existingNick) {
      throw new ConflictAPIError({ pointer: '/data/attributes/nick' })
    }

    const encryptedPassword = `bcrypt:${ctx.state.user.password}`

    await Anope.addNewUser({
      email: ctx.state.user.email,
      nick,
      encryptedPassword,
      vhost: ctx.state.user.vhost,
      ratId
    })

    const createdNick = Anope.findNickname(nick)
    const query = new AnopeQuery({ connection: ctx })
    ctx.response.status = StatusCode.created
    return new ObjectDocument({ query, result: createdNick, type: NicknameView, view: DocumentViewType.individual })
  }

  @DELETE('/nicknames/:nick')
  @websocket('nicknames', 'delete')
  @authenticated
  async delete (ctx) {
    const { nick } = ctx.params
    const nickname = await Anope.findNickname(nick)
    if (!nickname) {
      throw new NotFoundAPIError({ parameter: 'nick' })
    }

    if (nickname.display === nickname.nick) {
      throw new ConflictAPIError({ parameter: 'nick' })
    }

    this.requireWritePermission({ connection: ctx, entity: nickname })
    await Anope.removeNickname(nick)
    ctx.response.status = StatusCode.noContent
    return true
  }

  /**
   * Get a nicknames' linked rat relationship
   * @param {Context} ctx request context
   * @returns {Promise<DatabaseDocument>} a nicknames' linked rat relationship
   */
  @GET('/nicknames/:nick/relationships/rat')
  @websocket('nicknames', 'rat', 'read')
  @authenticated
  async relationshipDisplayRatView (ctx) {
    if (!ctx.params.nick) {
      throw new BadRequestAPIError({ parameter: 'nick' })
    }

    const nickname = await Anope.findNickname(ctx.params.nick)

    if (!nickname) {
      throw new NotFoundAPIError({ parameter: 'nick' })
    }

    this.requireReadPermission({ connection: ctx, entity: nickname })

    let rat = undefined
    if (nickname.ratId) {
      rat = await Rat.findOne({
        where: { id: nickname.ratId }
      })
    }


    const query = new DatabaseQuery({ connection: ctx })
    return new DatabaseDocument({ query, result: rat, type: NicknameView, view: DocumentViewType.meta })
  }

  /**
   * Set a user's display rat relationshi  p
   * @param {Context} ctx request context
   * @returns {Promise<DatabaseDocument>} an updated user with updated relationships
   */
  @PATCH('/nicknames/:nick/relationships/rat')
  @websocket('nicknames', 'rat', 'patch')
  @authenticated
  async relationshipFirstLimpetPatch (ctx) {
    // const user = await this.relationshipChange({
    //   ctx,
    //   databaseType: User,
    //   change: 'patch',
    //   relationship: 'displayRat'
    // })
    //
    // const query = new DatabaseQuery({ connection: ctx })
    // const result = await Anope.mapNickname(user)
    //
    // return new DatabaseDocument({ query, result, type: UserView, view: DocumentViewType.meta })
  }

  getReadPermissionFor ({ connection, entity }) {
    if (entity.user.id === connection.state.user.id) {
      return ['nickname.write', 'nickname.write.me']
    }
    return ['nickname.write']
  }

  getWritePermissionFor ({ connection, entity }) {
    if (entity.user.id === connection.state.user.id) {
      return ['nickname.write', 'nickname.write.me']
    }
    return ['nickname.write']
  }
}
