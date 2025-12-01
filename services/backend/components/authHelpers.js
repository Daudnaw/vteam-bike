import User from '../models/UserSchema.js'
import Connect from './connectHelpers.js'

class Auth {
  async authenticate(email, password) {
    await Connect.connect();
    return User.authenticate(email, password);
  }
}

export default new Auth();