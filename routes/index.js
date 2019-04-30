const express = require('express');
const db = require('../db');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { customer: req.session.customer });
});

router.get('/order', async (req, res) => {
  if (req.session.customer) {
    const query = 'SELECT * FROM products';
    const result = await db.query(query);

    const customizationQuery = 'SELECT * FROM customizations';
    const customizationResult = await db.query(customizationQuery);
    res.render('order', {
      customer: req.session.customer, products: result.rows, cartCount: req.session.cartCount, cuatomizations: customizationResult.rows,
    });
  } else {
    res.redirect('/users/login');
  }
});

router.get('/cart', (req, res) => {
  res.render('cart', { cart: req.session.cart, cartCount: req.session.cartCount });
});

module.exports = router;
