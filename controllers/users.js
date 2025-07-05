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

const createUser = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, email, oauthProvider, oauthId } = req.body;
    if (!name || !email || !oauthProvider || !oauthId) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const result = await db.collection('users').insertOne({ name, email, oauthProvider, oauthId });
    res.status(201).json(result.ops[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user.' });
  }
};

module.exports = { getAllUsers, createUser };