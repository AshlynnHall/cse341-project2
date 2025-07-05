const { ObjectId } = require('mongodb');

const getAllBooks = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const books = await db.collection('books').find().toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books.' });
  }
};

const getBookById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};

const createBook = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { title, author, genre, rating, review, userId, date } = req.body;
    if (!title || !author || !genre || !rating || !review || !userId || !date) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const result = await db.collection('books').insertOne({
      title, author, genre, rating, review, userId, date
    });
    res.status(201).json(result.ops[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create book.' });
  }
};

const updateBook = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { title, author, genre, rating, review, userId, date } = req.body;
    const result = await db.collection('books').replaceOne(
      { _id: new ObjectId(req.params.id) },
      { title, author, genre, rating, review, userId, date }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.collection('books').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };