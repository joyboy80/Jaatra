const http = require('http');
const payload = JSON.stringify({
  userType: "STUDENT",
  fullName: "Test User",
  departmentCode: "04",
  studentId: "099",
  phone: "01812345678",
  email: "u2204099@student.cuet.ac.bd",
  gender: "MALE",
  password: "Password123",
  confirmPassword: "Password123"
});
const options = {
  hostname: 'localhost',
  port: 5173,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};
const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS: ' + res.statusCode + '\nBODY: ' + data));
});
req.on('error', e => console.error(e));
req.write(payload);
req.end();
