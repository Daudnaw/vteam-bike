import User from '../models/UserSchema.js'
import Connect from './connectHelpers.js'

class Users {
  async addUser(data) {
    await Connect.connect();
    const user = new User(data);
    return await user.save();
  }

  async getAllUsers() {
    await Connect.connect();
    return await User.find();
  }

  async getOneUser(id) {
    await Connect.connect();
    return await User.findById(id);
  }

  async deleteOneUser(id) {
    await Connect.connect();
    return await User.findByIdAndDelete({ _id: id });
  }

  async authenticate(email, password) {
    await Connect.connect();
    return await User.authenticate(email, password);
  }
}

export default new Users();
