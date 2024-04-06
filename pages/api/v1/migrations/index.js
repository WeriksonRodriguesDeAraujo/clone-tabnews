import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

async function migrations(request, response) {
  const dbClient = await database.getNewClient();

  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    migrationsTable: "pgmigrations",
    direction: "up",
    verbose: true,
  }

  if (request.method === "GET") {
    const pendingMigrations = await migrationRunner(defaultMigrationOptions)
    
    await dbClient.end();
    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false
    })

    await dbClient.end();

    if (migratedMigrations.length) {
      return response.status(201).json(migratedMigrations);
    }
  
    return response.status(200).json(migratedMigrations);
  }
  
  await dbClient.end();
  return response.status(405).end();
}

export default migrations;