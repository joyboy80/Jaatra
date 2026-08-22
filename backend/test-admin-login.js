import dotenv from 'dotenv';

dotenv.config();

async function testAdminLogin() {
  console.log("Testing Admin Login...");
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'transportadmin@cuet.ac.bd', password: 'transportadmin123' })
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testAdminLogin();
