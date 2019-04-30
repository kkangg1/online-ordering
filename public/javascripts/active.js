
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
  document.querySelector('#resultsPassword').innerHTML = '22';
  let formattedResults = '';
  if (passwor !== confirmPassword) {
    formattedResults += '<div class="alert alert-danger"> That username is already taken.</div>';
  }
  document.querySelector('#resultsPassword').innerHTML = formattedResults;
}

async function addCart(id, quantity) {
  console.log('adfafdg');
  const result = await axios.post('/api/cart', { product_id: id, quantity });
  document.querySelector('#cartCount').innerHTML = result.data.cartCount;
}
