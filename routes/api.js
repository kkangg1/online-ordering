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
  console.log('fghj');
  const query = 'SELECT name, price FROM products WHERE products.id = $1';
  const param = [req.body.product_id];
  const result = await db.query(query, param);
  const len = req.session.cart.length;
  let tt = true;
  for (let i = 0; i < len; i += 1) {
    if (req.session.cart[i].product_id === req.body.product_id) {
      req.session.cart[i].quantity += req.body.quantity;
      req.session.cart[i].subTotal += req.body.quantity*req.session.cart[i].price;
      tt = false;
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
    });
    req.session.nextCartId += 1;
  }
  req.session.cartCount += req.body.quantity;
  res.json({
    cartCount: req.session.cartCount,
    cart: req.session.cart,
  });
});

module.exports = router;
