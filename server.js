const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());

const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

const booksRoutes = require('./routes/books');
app.use('/books', booksRoutes);

const client = new MongoClient(process.env.MONGODB_URI);

async function start() {
  try {
    await client.connect();
    app.locals.db = client.db('books');
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Connected to DB and listening on ${port}`);
    });
  } catch (err) {
    console.error('Failed to connect to DB', err);
  }
}

app.get('/', (req, res) => {
  res.send('Book Review API is running!');
});

start();