import database from 'infra/database.js';

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const resultMaxConections = await database.query(`SHOW max_connections;`);
  const maxConectionsValue = parseInt(resultMaxConections.rows[0].max_connections);

  const databaseName = process.env.POSTGRES_DB;
  const resultActiveConections = await database.query({
    text: `SELECT
    COUNT(*)::int
  FROM
    pg_stat_activity
  WHERE
    datname = $1;`,
    values: [databaseName]
  });
  const activeConectionsValue = resultActiveConections.rows[0].count;

  const resultVersion = await database.query(`SHOW server_version;`);
  const versionValue = resultVersion.rows[0].server_version;

  response.status(200).json({
    updated_at: updatedAt,
    database: {
      dependencies: {
        version: versionValue,
        max_conections: maxConectionsValue,
        active_conections: activeConectionsValue
      }
    }
   });
}

export default status;