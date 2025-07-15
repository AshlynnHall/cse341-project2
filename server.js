const express = require('express');
const { MongoClient } = require('mongodb');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
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

const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Book Review API is running!');
});

// Smiddleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); 
  }
);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

app.use('/books', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return ensureAuthenticated(req, res, next);
  }
  next();
});
app.use('/users', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return ensureAuthenticated(req, res, next);
  }
  next();
});

start();