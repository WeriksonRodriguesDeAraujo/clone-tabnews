import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "infra/database.js";

import migrator from "models/migrator.js";
import user from "models/user.js";
import session from "models/session.js";

async function waitForAllServices() {
  await waitForWebServer();
}

async function waitForWebServer() {
  return retry(fetchStatusPage, {
    retries: 100,
    maxTimeout: 1000,
  });
}

async function clearDataBase() {
  await database.query("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;");
}

async function fetchStatusPage() {
  const response = await fetch("http://localhost:3000/api/v1/status");

  if (!response.ok) {
    throw Error();
  }
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(request) {
  return await user.create({
    username:
      request?.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: request?.email || faker.internet.email(),
    password: request?.password || faker.internet.password(),
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

const orchestrator = {
  waitForAllServices,
  clearDataBase,
  runPendingMigrations,
  createUser,
  createSession,
};

export default orchestrator;
