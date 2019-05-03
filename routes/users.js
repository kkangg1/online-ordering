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
    const selectQuery = 'SELECT * FROM products WHERE NOT category = $1';
    const selectResult = await db.query(selectQuery, ['custom']);
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
      req.session.cart = [];
      req.session.cartCount = 0;
      req.session.nextCartId = 1;
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
  const selectQuery = 'SELECT * FROM products WHERE NOT category = $1';
  const selectCustomizationQuery = 'SELECT * FROM customizations';
  const selectResult = await db.query(selectQuery, ['custom']);
  const selectCustomizationResult = await db.query(selectCustomizationQuery);
  console.log(req.session.cart);
  res.render('menu', {
    poducts: selectResult.rows,
    user: req.session.user,
    cartCount: req.session.cartCount,
    customizations: selectCustomizationResult.rows,
  });
});

/* Cart */
router.get('/cart', async (req, res) => {
  let totalPrice = 0;
  for (let i = 0; i < req.session.cart.length; i += 1) {
    totalPrice += req.session.cart[i].subTotal;
  }
  totalPrice = totalPrice.toFixed(2) * 1;
  res.render('cart', { cart: req.session.cart, cartCount: req.session.cartCount, totalPrice });
});

/* Cart */
router.get('/order', async (req, res) => {
  const selectQuery = 'SELECT orders.id AS id, order_lines.quantity AS quantity, order_lines.price AS price, created_at AS date, products.name AS name, customizations.name AS custom, products.category AS category, product_id FROM order_lines INNER JOIN orders ON order_lines.order_id = orders.id INNER JOIN products ON order_lines.product_id = products.id LEFT JOIN order_line_customizations ON order_lines.id = order_line_customizations.order_line_id LEFT JOIN customizations ON customizations.id = order_line_customizations.customization_id WHERE orders.customer_id = $1 ORDER BY id';
  const selectResult = await db.query(selectQuery, [req.session.user.id]);
  let order = [];
  const orders = [];
  for (let i = 0; i < selectResult.rowCount; i += 1) {
    const tempPrice = selectResult.rows[i].price.match(/\d+(.\d+)?/g)[0] * 1;
    let boo = true;
    for (let j = 0; j < orders.length; j += 1) {
      if (orders[j].id === selectResult.rows[i].id) {
        let bol = true;
        for (let k = 0; k < orders[j].order.length; k += 1) {
          if (orders[j].order[k].productId === selectResult.rows[i].product_id) {
            orders[j].order[k].custom += ' ' + selectResult.rows[i].custom;
            bol = false;
            boo = false;
          }
        }
        if (bol) {
          orders[j].totalPrice += tempPrice;
          const temp = orders[j].totalPrice;
          orders[j].order.push({
            name: selectResult.rows[i].name,
            quantity: selectResult.rows[i].quantity,
            price: selectResult.rows[i].price,
            productId: selectResult.rows[i].product_id,
            custom: selectResult.rows[i].custom,
          });
          boo = false;
          orders[j].totalPrice = temp.toFixed(2) * 1;
        }
      }
    }
    if (boo) {
      order.push({
        name: selectResult.rows[i].name,
        quantity: selectResult.rows[i].quantity,
        date: selectResult.rows[i].date,
        price: selectResult.rows[i].price,
        productId: selectResult.rows[i].product_id,
        custom: selectResult.rows[i].custom,
      });
      orders.push({
        id: selectResult.rows[i].id,
        date: selectResult.rows[i].date,
        totalPrice: tempPrice,
        order,
      });
    }
    order = [];
  }
  console.log(selectResult);
  res.render('order', { order: orders, cartCount: req.session.cartCount });
});

module.exports = router;
