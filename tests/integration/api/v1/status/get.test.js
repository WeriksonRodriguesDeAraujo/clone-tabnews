import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

test("Get to /api/v1/status should status 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.updated_at).toBeDefined();
  expect(responseBody.database.dependencies.max_conections).toBeDefined();
  expect(responseBody.database.dependencies.active_conections).toBeDefined();
  expect(responseBody.database.dependencies.version).toBeDefined();

  const parserUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toEqual(parserUpdatedAt);

  expect(responseBody.database.dependencies.max_conections).toEqual(100);
  expect(responseBody.database.dependencies.active_conections).toEqual(1);
  expect(responseBody.database.dependencies.version).toEqual("16.0");
});
