const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
require('dotenv').config();

(async () => {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    const email = 'test+ci@example.com';
    const resetToken = jwt.sign({ email }, jwtSecret, { expiresIn: '15m' });
    console.log('Generated resetToken:', resetToken);

    const res = await fetch('http://localhost:3001/api/users/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword: 'NewPass123' })
    });

    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
