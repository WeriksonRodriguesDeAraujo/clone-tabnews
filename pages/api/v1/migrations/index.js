import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

async function migrations(request, response) {
  const allowMethods = ["GET", "POST"];
  if (!allowMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`
    })
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();

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
      
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false
      })

      if (migratedMigrations.length) {
        return response.status(201).json(migratedMigrations);
      }
    
      return response.status(200).json(migratedMigrations);
    }
  } catch(error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}

export default migrations;