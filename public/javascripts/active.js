
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


async function password() {
  const passwor = $('#password').val();
  const confirmPassword = $('#passwordConf').val();
  document.querySelector('#resultsPassword').innerHTML = '22';
  let formattedResults = '';
  if (passwor !== confirmPassword) {
    formattedResults += '<div class="alert alert-danger"> That username is already taken.</div>';
  }
  document.querySelector('#resultsPassword').innerHTML = formattedResults;
}

async function addCart() {

}


async function search() {
  document.querySelector('#results').innerHTML = '';

  if (document.querySelector('#query').value) {
    const results = await axios.get('api/people?q=' + document.querySelector('#query').value);
    let formattedResults = '';

    results.data.forEach((result) => {
      formattedResults += '<h1>' + result.first_name + ' ' + result.last_name + '</h1>';
      formattedResults += '<h2>' + result.major + '</h2>';
    });
    document.querySelector('#results').innerHTML = formattedResults;
  }
}

async function newPerson() {
  const post = {
    uniqueid: document.querySelector('#uniqueid').value,
    first_name: document.querySelector('#firstName').value,
    last_name: document.querySelector('#lastName').value,
    major: document.querySelector('#major').value,
  };

  const result = await axios.post('api/people', post);

  const newPerson = document.createElement('div');
  newPerson.innerHTML = result.data.first_name + ' ' + result.data.last_name;
  document.querySelector('#people').appendChild(newPerson);

  document.querySelector('#uniqueid').value = '';
  document.querySelector('#firstName').value = '';
  document.querySelector('#lastName').value = '';
  document.querySelector('#major').value = '';
}
