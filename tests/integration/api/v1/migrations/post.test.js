import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

async function cleanDataBase() {
  await database.query("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;");
}

beforeAll(async () => {
  await cleanDataBase();
  await orchestrator.waitForAllServices();
});

test('Post to /api/v1/migrations should status 200', async () => {
  const response1 = await fetch('http://localhost:3000/api/v1/migrations', {
    method: "POST"
  });

  expect(response1.status).toBe(201);

  const responseBody = await response1.json();

  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);

  const response2 = await fetch('http://localhost:3000/api/v1/migrations', {
    method: "POST"
  });

  expect(response2.status).toBe(200);

  const response2Body = await response2.json();

  expect(Array.isArray(response2Body)).toBe(true);
  expect(response2Body.length).toBe(0);
})