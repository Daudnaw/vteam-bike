import User from '../models/UserSchema.js'
import Connect from './connectHelpers.js'

class Users {
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

  async updateUser(id, data) {
    await Connect.connect();
    return await User.findOneAndUpdate({ _id: id }, data,
      {
        new: true,
        runValidators: true
      }
    )
  }
}

export default new Users();
