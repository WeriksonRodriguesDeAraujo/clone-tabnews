import database from "infra/database";

async function cleanDataBase() {
  await database.query("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;");
}

beforeAll(cleanDataBase);

test('Get to /api/v1/migrations should status 200', async () => {
  const response = await fetch('http://localhost:3000/api/v1/migrations');
  expect(response.status).toBe(200);

  const responseBody = await response.json();

  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);
})