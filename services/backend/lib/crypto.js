import { scrypt as _scrypt } from 'node:crypto'
import { promisify } from 'node:util'

export const scrypt = promisify(_scrypt)