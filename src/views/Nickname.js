import DatabaseView from './Database'
import RescueView from './Rescue'
import ShipView from './Ship'
import UserView from './User'
import { ReadPermission } from './index'

export default class NicknameView extends DatabaseView {
  static get type () {
    return 'nicknames'
  }

  get attributes () {
    return class {
      static lastQuit
      static lastRealHost = ReadPermission.group
      static lastRealName
      static lastSeen
      static lastUserMask
      static account
      static nick
      static createdAt
      static updatedAt
      static vhost
      static vhostSetBy = ReadPermission.internal
      static vhostSetAt = ReadPermission.internal
      static email = ReadPermission.group
      static password = ReadPermission.internal
      static fingerprint = ReadPermission.internal
      static score
    }
  }

  get defaultReadPermission () {
    return ReadPermission.all
  }

  get isSelf () {
    if (this.query.connection.state.user && this.object.user.id === this.query.connection.state.user.id) {
      return this.query.connection.state.permissions.includes('nickname.read.me')
    }
    return false
  }

  get isGroup () {
    return this.query.connection.state.permissions.includes('nickname.read')
  }

  get isInternal () {
    return this.query.connection.state.permissions.includes('nickname.internal')
  }

  get relationships () {
    return {
      user: UserView
    }
  }

  get related () {
    return []
  }

  get includes () {
    return ['user']
  }
}