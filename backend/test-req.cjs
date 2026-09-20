const http = require('http');
const payload = JSON.stringify({
  fullName: "Test User",
  email: "u2204099@student.cuet.ac.bd",
  password: "Password123",
  userType: "STUDENT",
  studentId: "099",
  departmentCode: "04",
  gender: "MALE",
  phone: "01812345678"
});
const options = {
  hostname: 'localhost',
  port: 5000,
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
