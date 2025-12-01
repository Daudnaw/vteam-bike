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

export default router;