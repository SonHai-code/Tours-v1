/*eslint-disable*/

// Define login function
const login = async (email, password) => {
  const config = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'x-api-key': 'abcdefghi',
      'Access-Control-Request-Method': 'POST',
      // 'Access-Control-Allow-Headers': ['X-PINGOTHER', 'Content-Type'],
    },
  };

  console.log(email, password);
  // Send post request
  try {
    const res = await axios({
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      method: 'POST',
      config,
      data: {
        email,
        password,
      },
    });
    console.log(res);
  } catch (err) {
    console.log(err);
    console.log(err.response.data);
  }
};

// e stand for event
document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  // Get the email and password from user's submit
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
