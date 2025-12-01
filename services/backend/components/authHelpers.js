import User from '../models/UserSchema.js'
import Connect from './connectHelpers.js'

class Auth {
  async authenticate(email, password) {
    await Connect.connect();
    return User.authenticate(email, password);
  }

  async register(data) {
    await Connect.connect();
    const user = new User(data);
    return await user.save();
  }

  async changePassword(email, oldPassword, newPassword) {
    await Connect.connect();
    const user = await User.authenticate(email, oldPassword);
    user.password = newPassword;
    
    await user.save();
    return user;
  }
}

export default new Auth();