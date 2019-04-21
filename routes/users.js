const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.redirect('home');
});
router.get('/home', async (req, res) => {
  if (req.session.user) {
    res.render('userhome', { user: req.session.user });
  } else {
    const selectQuery = 'SELECT * FROM products';
    const selectResult = await db.query(selectQuery);
    res.render('homePage', { poducts: selectResult.rows });
  }
});
router.get('/login', (req, res) => {
  res.render('login');
});

/* User Registration. */
router.get('/register', (req, res) => {
  res.render('register');
});
router.post('/register', async (req, res) => {
  const errors = [];
  if (req.body.password !== req.body.passwordConf) {
    errors.push('The provided passwords do not match.');
  }
  if (!(req.body.email && req.body.username && req.body.password && req.body.passwordConf)) {
    errors.push('All fields are required.');
  }
  const selectQuery = 'SELECT * FROM customers WHERE username = $1 ';
  const selectResult = await db.query(selectQuery, [req.body.username]);
  console.log(selectResult);
  if (selectResult.rows.length > 0) {
    errors.push('That username is already taken.');
  }
  const name = req.body.firstname + ' ' + req.body.lastname;
  if (!errors.length) {
    const insertQuery = 'INSERT INTO customers (username, name, email, password) VALUES ($1, $2, $3, $4)';
    const password = await bcrypt.hash(req.body.password, 10);
    await db.query(insertQuery, [req.body.username, name, req.body.email, password]);
    res.redirect('login');
  } else {
    res.render('register', { errors });
  }
});

/* User Log In. */
router.post('/login', async (req, res) => {
  const errors = [];

  const selectQuery = 'SELECT * FROM customers WHERE username = $1';
  const selectResult = await db.query(selectQuery, [req.body.username]);
  if (selectResult.rows.length === 1) {
    const auth = await bcrypt.compare(req.body.password, selectResult.rows[0].password);

    if (auth) {
      [req.session.user] = selectResult.rows;
      res.redirect('/');
    } else {
      errors.push('Incorrect username/password');
      res.render('login', { errors });
    }
  } else {
    errors.push('Incorrect username/password');
    res.render('login', { errors });
  }
});

/* User Log Out. */
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('home');
});

/* Menu */
router.get('/menu', async (req, res) => {
  const selectQuery = 'SELECT * FROM products';
  const selectResult = await db.query(selectQuery);
  res.render('menu', { poducts: selectResult.rows, user: req.session.user });
});

module.exports = router;
