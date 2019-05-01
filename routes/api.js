const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/username', async (req, res) => {
  const selectQuery = 'SELECT * FROM customers WHERE username = $1 ';
  const selectResult = await db.query(selectQuery, [req.query.q]);
  res.json(selectResult.rows);
});

router.get('/password', async (req, res) => {
  let result = false;
  if (req.query.p !== req.query.pc) {
    result = true;
  }
  console.log(result);

  res.json(result);
});

router.post('/cart', async (req, res) => {
  console.log('1');
  const query = 'SELECT name, price FROM products WHERE products.id = $1';
  const param = [req.body.product_id];
  const result = await db.query(query, param);
  let custom = '';
  if (req.body.customizations) {
    const customizations = await db.query('SELECT * FROM customizations');
    for (let i = 0; i < customizations.rows.length; i += 1) {
      for (let j = 0; j < req.body.customizations.length; j += 1) {
        if (req.body.customizations[j] == customizations.rows[i].id) {
          custom += ' ' + customizations.rows[i].name;
        }
      }
    }
  }
  const len = req.session.cart.length;
  let tt = true;
  if (req.body.product_id) {
    for (let i = 0; i < len; i += 1) {
      if (req.session.cart[i].product_id === req.body.product_id) {
        req.session.cart[i].quantity += req.body.quantity;
        req.session.cart[i].subTotal += req.body.quantity * req.session.cart[i].price;
        tt = false;
      }
    }
  }
  const num = result.rows[0].price.match(/\d+(.\d+)?/g);
  if (tt) {
    req.session.cart.push({
      cart_id: req.session.nextCartId,
      product_id: req.body.product_id,
      name: result.rows[0].name,
      quantity: req.body.quantity,
      price: num[0],
      subTotal: num[0] * req.body.quantity,
      customdetail: custom,
    });
    req.session.nextCartId += 1;
  }
  req.session.cartCount += req.body.quantity;
  res.json({
    cartCount: req.session.cartCount,
    cart: req.session.cart,
  });
});

router.post('/changeCart', async (req, res) => {
  const len = req.session.cart.length;
  let count = req.session.cartCount;
  console.log(req.body.cart_id);
  for (let i = 0; i < len; i += 1) {
    if (req.body.cart_id === req.session.cart[i].cart_id) {
      count -= req.session.cart[i].quantity;
      req.session.cart[i].quantity = req.body.quantity;
      req.session.cart[i].subTotal = req.session.cart[i].price * req.body.quantity;
      count += req.body.quantity * 1;
    }
  }
  req.session.cartCount = count * 1;

  res.json({
    cartCount: req.session.cartCount,
    cart: req.session.cart,
  });
});

router.post('/custom', async (req, res) => {
  let description = '';
  for (let i = 0; i < req.body.customizations.length; i += 1) {
    description += ' ' + req.body.customizations[i];
  }
  const result = await db.query('INSERT INTO products (name, description, category, price ) VALUES ($1, $2, $3, $4 ) RETURNING id', [
    'Custome Pizza',
    description,
    'custom',
    req.body.customPrice,
  ]);
  res.json({
    custom_id: result.rows[0].id,
  });
});

module.exports = router;
