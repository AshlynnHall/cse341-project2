const { ObjectId } = require('mongodb');

const getAllUsers = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

const getUserById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};

const createUser = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const user = { name, email };
    const result = await db.collection('users').insertOne(user);
    user._id = result.insertedId; // Add the generated ID to the response
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, email } = req.body;
    const result = await db.collection('users').replaceOne(
      { _id: new ObjectId(req.params.id) },
      { name, email }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };