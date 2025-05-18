import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function create(request) {
  async function runInsertQuery(request) {
    const query = `
INSERT INTO 
  users (username, email, password)
VALUES 
  ($1, $2, $3) 
RETURNING *
;`;

    const result = await database.query({
      text: query,
      values: [request.username, request.email, request.password],
    });

    return result.rows[0];
  }

  // TODO Pode ser feito uma única validação para evitar consultas excessivas ao banco.
  await _validateUniqueEmail(request.email);
  await _validateUniqueUsername(request.username);
  await _hashPasswordInObject(request);

  const newUser = await runInsertQuery(request);
  return newUser;
}

async function findOneByUsername(username) {
  const query = `
SELECT 
  *
FROM
  users
WHERE
  LOWER(username) = LOWER($1)
LIMIT
  1
;`;

  const result = await database.query({
    text: query,
    values: [username],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "O username informado não foi encontrado no sistema.",
      action: "Verifique se o username está digitado corretamente.",
    });
  }

  return result.rows[0];
}

async function _validateUniqueEmail(email) {
  const query = `
SELECT 
  email,
  username
FROM
  users
WHERE
  LOWER(email) = LOWER($1)
;`;

  const result = await database.query({
    text: query,
    values: [email],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar o cadastro.",
    });
  }
}

async function _validateUniqueUsername(username) {
  const query = `
SELECT 
  username
FROM
  users
WHERE
  LOWER(username) = LOWER($1)
;`;

  const result = await database.query({
    text: query,
    values: [username],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O nome do usuário informado já está sendo utilizado.",
      action: "Utilize outro nome para realizar o cadastro.",
    });
  }
}

async function _hashPasswordInObject(request) {
  const hashedPassword = await password.hash(request.password);
  request.password = hashedPassword; // Não é uma boa prática
}

const user = {
  create,
  findOneByUsername,
};

export default user;
