import mongoose from 'mongoose'
import { scrypt } from '../lib/crypto.js'
import { randomBytes } from 'node:crypto'
import { AuthenticationError } from '../lib/authentication-error.js'

const { Schema, model } = mongoose

/**
 * @typedef User
 * @property {string} _id
 * @property {string} firstName.required
 * @property {string} lastName.required
 * @property {string} email.required
 * @property {string} password.required
 * @property {string} salt
 * @property {Function} verifyPassword
 * @property {Function} authenticate
 * @property {Function} toJSON
 */

const schema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
  },
})

schema.options.toJSON = {
  transform: (_, ret) => {
    ret._id = ret._id.toString()
    delete ret.password
    delete ret.salt
    delete ret.__v
    return ret
  },
}

schema.pre('save', async function () {
  if (!this.isModified('password')) return

  try {
    const salt = randomBytes(16).toString('hex')
    const key = await scrypt(this.password, salt, 64)
    this.password = key.toString('hex')
    this.salt = salt
  } catch (err) {
    console.error("Error hashing password in pre('save'):", err)
    throw err
  }
})

schema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate()
  if (!update.password) return

  try {
    const salt = randomBytes(16).toString('hex')
    const key = await scrypt(update.password, salt, 64)
    update.password = key.toString('hex')
    update.salt = salt
  } catch (err) {
    console.error("Error hashing password in pre('findOneAndUpdate'):", err)
    throw err
  }
})

schema.statics.authenticate = async function (email, password) {
  const user = await this.findOne({ email })

  if (!user) throw new AuthenticationError(`No such email: ${email}`)

  const valid = await user.verifyPassword(password)

  if (!valid) throw new AuthenticationError('Invalid password')

  return user
}

schema.methods.verifyPassword = async function (password) {
  const key = await scrypt(password, this.salt, 64)
  return key.toString('hex') === this.password
}

const User = model('User', schema)

export default User