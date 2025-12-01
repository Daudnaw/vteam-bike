import express from 'express'
import mongoose from 'mongoose'
import Users from '../components/usersHelpers.js'

const router = express.Router()

router.get('/', async (req, res) => {  
  try {
    const users = await Users.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("Error in GET /users", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get('/:id', async function(req, res, next) {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const user = await Users.getOneUser(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error in GET /users/:id", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.delete('/:id', async function (req, res) {
  const id = req.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const user = await Users.deleteOneUser(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      success: "User deleted",
      data: user
    });
  } catch (err) {
    console.error("Error in DELETE /users/:id", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  const forbidden = ['password', 'salt', '_id']

  for (const f of forbidden) {
    if (f in data) {
      return res.status(400).json({
        error: `Field '${f}' cannot be updated through this endpoint`
      });
    }
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const updated = await Users.updateUser(id, data);
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error in PUT /users/:id", err);
    res.status(500).json({ error: err.message });
  }
})

export default router;
