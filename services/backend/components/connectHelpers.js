import mongoose from 'mongoose'

class Connect {
  async connect() {
    const uri = process.env.MONGODB_DSN;

    if (mongoose.connection.readyState === 1) {
      return;
    }

    try {
      await mongoose.connect(uri);
      console.log("Mongo connected");
    } catch (err) {
      console.error("Failed to connect to UserDB:", err.message);
      throw err;
    }
  }
}

export default new Connect();