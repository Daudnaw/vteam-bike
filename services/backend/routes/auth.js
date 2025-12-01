import express from 'express'
import Auth from '../components/authHelpers.js'
import { AuthenticationError } from '../lib/authentication-error.js'

const router = express.Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Auth.authenticate(email, password);
    res.json(user);
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return res.status(401).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post('/register',
  (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "firstName, lastName, email and password are required" });
    }

    next();
  },
  async (req, res) => {
    try {
      const newUser = await Auth.register(req.body);
      res.status(201).json(newUser);
    } catch (err) {
      console.error("Error in POST /users", err);
      res.status(500).json({ error: "Could not add user" });
    }
  }
);

router.post('/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({
      error: 'email, oldPassword and newPassword are required'
    })
  }

  try {
    const user = await Auth.changePassword(email, oldPassword, newPassword)

    res.status(200).json({
      message: 'Password updated successfully',
      user,
    })
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return res.status(401).json({ error: err.message })
    }

    console.error('Error in POST /auth/change-password', err)
    res.status(500).json({ error: 'Could not change password' })
  }
})

export default router;