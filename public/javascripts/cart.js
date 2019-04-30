async function addToCart(id, quantity) {
  const result = await axios.post('/api/cart', { product_id: id, quantity });
  console.log(result);

  document.querySelector('#cartCount').innerHTML = result.data.cartCount;
};

async function addCustomPizza(quantity) {
  const checkedBoxes = document.querySelectorAll('input [type="checkbox"]:checked');
  console.log(checkedBoxes);
  
  const customizations =[];
  for (let i = 0; i < checkedBoxes.length; i++) {
    customizations.push(checkedBoxes[i].value);
  }
  console.log(customizations);
  const result = await axios.post('/api/cart', { product_id: 11, quantity, customizations });
};