async function test() {
  const token = ""; // Need a valid token. Let's just login first.
  const loginRes = await fetch('http://localhost:3005/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@deccanfilings.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  console.log("Login:", loginData);

  if (!loginData.token) return;

  console.log("Creating coupon...");
  try {
    const res = await fetch('http://localhost:3005/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        code: 'TEST API 1',
        discount_type: 'percentage',
        discount_value: 20,
        max_discount: -1,
        min_order_value: null,
        usage_limit: null,
        valid_until: null,
        active: true
      })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
test();
