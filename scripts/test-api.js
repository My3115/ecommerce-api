
const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

async function test(name, callback) {
  try {
    const result = await callback();

    if (result) {
      console.log(`PASS - ${name}`);
      passed++;
    } else {
      console.error(`FAIL - ${name}`);
      failed++;
    }
  } catch (error) {
    console.error(`FAIL - ${name}: ${error.message}`);
    failed++;
  }
}

async function request(path, options = {}) {
  return fetch(`${BASE_URL}${path}`, options);
}

async function main() {
  console.log("=== E-commerce API Test ===");

  await test("Health check and database", async () => {
    const res = await request("/health");
    const data = await res.json();

    return res.status === 200 &&
      data.success === true &&
      data.database === "connected";
  });

  await test("Get products", async () => {
    const res = await request("/api/products");
    const data = await res.json();

    return res.status === 200 &&
      data.success === true &&
      Array.isArray(data.data);
  });

  await test("Reject negative product price", async () => {
    const res = await request("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pname: "Invalid Test Product",
        price: -100,
        quantity: 1,
      }),
    });

    return res.status === 400;
  });

  await test("Reject negative product quantity", async () => {
    const res = await request("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pname: "Invalid Test Product",
        price: 10000,
        quantity: -1,
      }),
    });

    return res.status === 400;
  });

  const loginRes = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "mycustomer",
      password: "123456",
    }),
  });

  let token;
  if (loginRes.ok) {
    const loginData = await loginRes.json();
    token = loginData.data?.accessToken;
  }

  await test("Customer login and JWT", async () => {
    return loginRes.status === 200 && Boolean(token);
  });

  if (token) {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    await test("Get current user with JWT", async () => {
      const res = await request("/api/auth/me", { headers });
      const data = await res.json();

      return res.status === 200 &&
        data.success === true &&
        data.data?.username === "mycustomer" &&
        !("password" in data.data);
    });

    await test("Reject Customer shipment status update", async () => {
      const res = await request("/api/shipments/1/status", {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Delivered" }),
      });

      return res.status === 403;
    });
  }

  await test("Reject order access without JWT", async () => {
    const res = await request("/api/orders");
    return res.status === 401;
  });

  console.log("\n=== Test Summary ===");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main();
