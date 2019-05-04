
async function check() {
  document.querySelector('#resultsUsername').innerHTML = '';
  if (document.querySelector('#username').value) {
    const results = await axios.get('../api/username?q=' + document.querySelector('#username').value);
    let formattedResults = '';
    if (results.data.length) {
      formattedResults += '<div class="alert alert-danger"> That username is already taken.</div>';
    }
    document.querySelector('#resultsUsername').innerHTML = formattedResults;
  }
}
let timeout = null;
function ck_timeout() {
  clearTimeout(timeout);
  timeout = setTimeout(check, 500);
}

async function pass() {
  const passwor = $('#password').val();
  const confirmPassword = $('#passwordConf').val();
  let formattedResults = '';
  if (passwor !== confirmPassword) {
    formattedResults += '<div class="alert alert-danger"> That username is already taken.</div>';
  }
  document.querySelector('#resultsPassword').innerHTML = formattedResults;
}

async function addCart(id, quantity) {
  const result = await axios.post('/api/cart', { product_id: id, quantity });
  document.querySelector('#cartCount').innerHTML = result.data.cartCount;
}

async function addCustom(quantity) {
  const checkBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
  if (checkBoxes.length === 0) {
    document.querySelector('#customOption').innerHTML = '<div class="alert alert-danger"> Please select at least one option </div>';
    console.log('checkBoxes');
  } else {
    console.log('hhh');
    const customizations = [];
    for (let i = 0; i < checkBoxes.length; i += 1) {
      checkBoxes[i].checked = false;
      customizations.push(checkBoxes[i].value);
    }
    const customPrice = 8 + checkBoxes.length;
    const id = await axios.post('/api/custom', { customizations, customPrice });
    const result = await axios.post('/api/cart', { product_id: id.data.custom_id, quantity, customizations });
    document.querySelector('#cartCount').innerHTML = result.data.cartCount;
  }
}

async function changeCart(id) {
  const quantity = document.getElementById(id).value * 1;
  let result = '';
  if (quantity === 0) {
    result = await axios.post('/api/removeCart', { cart_id: id });
    document.querySelector('#delet' + id).innerHTML = '';
  } else {
    result = await axios.post('/api/changeCart', { cart_id: id, quantity });
  }
  const str = '#subTotal' + id;
  console.log(result.data.cart);
  let totalPrice = 0;
  for (let i = 0; i < result.data.cart.length; i += 1) {
    totalPrice += result.data.cart[i].subTotal;
    if (result.data.cart[i].cart_id === id) {
      document.querySelector(str).innerHTML = '$' + result.data.cart[i].subTotal;
    }
  }
  document.querySelector('#cartCount').innerHTML = result.data.cartCount;
  document.querySelector('#totalPrice').innerHTML = 'Total price is $' + totalPrice.toFixed(2) * 1;
}
async function removeAllCart() {
  console.log('4');
  const result = await axios.post('/api/removeAllCart');
  console.log('gg');
  document.querySelector('#cart').innerHTML = '';
  const totalPrice = 0;
  document.querySelector('#cartCount').innerHTML = result.data.cartCount;
  document.querySelector('#totalPrice').innerHTML = 'Total price is $' + totalPrice;
}

async function removeCart(id) {
  const result = await axios.post('/api/removeCart', { cart_id: id });
  document.querySelector('#delet' + id).innerHTML = '';
  let totalPrice = 0;
  for (let i = 0; i < result.data.cart.length; i += 1) {
    totalPrice += result.data.cart[i].subTotal;
  }
  document.querySelector('#cartCount').innerHTML = result.data.cartCount;
  document.querySelector('#totalPrice').innerHTML = 'Total price is $' + totalPrice.toFixed(2) * 1;
}

function timmer(id) {
  clearTimeout(timeout);
  timeout = setTimeout(() => { changeCart(id); }, 500);
}

async function placeOrder() {
  const a = await axios.post('/api/placeOrder');
  const result = await axios.post('/api/removeAllCart');
  window.location.href = 'order';
}
/**
 * 
 */