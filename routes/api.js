/* eslint-disable no-await-in-loop */
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
      quantity: req.body.quantity * 1,
      price: num[0],
      subTotal: num[0] * req.body.quantity.toFixed(2) * 1,
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
  for (let i = 0; i < len; i += 1) {
    if (req.body.cart_id === req.session.cart[i].cart_id) {
      count -= req.session.cart[i].quantity;
      req.session.cart[i].quantity = req.body.quantity * 1;
      req.session.cart[i].subTotal = (req.session.cart[i].price * req.body.quantity).toFixed(2) * 1;
      count += req.body.quantity * 1;
    }
  }
  req.session.cartCount = count * 1;

  res.json({
    cartCount: req.session.cartCount,
    cart: req.session.cart,
  });
});

router.post('/removeCart', async (req, res) => {
  console.log(req.session.cart[req.body.cart_id]);
  for (let i = 0; i < req.session.cart.length; i += 1) {
    if (req.session.cart[i].cart_id === req.body.cart_id) {
      req.session.cartCount -= req.session.cart[i].quantity;
      req.session.cart.splice(i, 1);
    }
  }
  res.json({
    cartCount: req.session.cartCount,
    cart: req.session.cart,
  });
});

router.post('/removeAllCart', async (req, res) => {
  req.session.cart.length = 0;
  req.session.cartCount = 0;
  res.json({
    cartCount: req.session.cartCount,
    cart: req.session.cart,
  });
});
router.post('/custom', async (req, res) => {
  let description = ' ';
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

router.post('/placeOrder', async (req, res) => {
  const order = await db.query('INSERT INTO orders (customer_id, created_at) VALUES ($1, $2) RETURNING id', [
    req.session.user.id,
    new Date().toLocaleString(),
  ]);
  console.log('2');
  for (let i = 0; i < req.session.cart.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    console.log('3');
    console.log(order.rows[0].id);
    console.log(req.session.cart[i].product_id);
    console.log(req.session.cart[i].quantity);
    console.log(req.session.cart[i].subTotal);
    const orderLine = await db.query('INSERT INTO order_lines (order_id, product_id, quantity, price ) VALUES ( $1, $2, $3, $4 ) RETURNING id', [
      order.rows[0].id,
      req.session.cart[i].product_id,
      req.session.cart[i].quantity,
      req.session.cart[i].subTotal,
    ]);
    if (req.session.cart[i].customdetail !== '') {
      console.log('4');
      const custom = await db.query('SELECT description FROM products WHERE products.id = $1', [
        req.session.cart[i].product_id,
      ]);
      const customizations = custom.rows[0].description.split(' ');
      console.log('5');
      for (let j = 0; j < customizations.length; j += 1) {
        const value = customizations[j] * 1;
        if (value !== 0) {
          console.log('value');
          const aa = await db.query('INSERT INTO order_line_customizations (customer_id, order_line_id, customization_id ) VALUES ($1, $2, $3)', [
            req.session.user.id,
            orderLine.rows[0].id,
            value,
          ]);
        }
      }
    }
  }
  res.json({
    custom_id: '',
  });
});
module.exports = router;
