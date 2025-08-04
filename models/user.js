import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

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

async function findOneByEmail(email) {
  const query = `
SELECT 
  *
FROM
  users
WHERE
  LOWER(email) = LOWER($1)
LIMIT
  1
;`;

  const result = await database.query({
    text: query,
    values: [email],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "O email informado não foi encontrado no sistema.",
      action: "Verifique se o email está digitado corretamente.",
    });
  }

  return result.rows[0];
}

async function create(userInputValues) {
  async function runInsertQuery(userInputValues) {
    const query = `
INSERT INTO 
  users (username, email, password)
VALUES 
  ($1, $2, $3) 
RETURNING *
;`;

    const results = await database.query({
      text: query,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return results.rows[0];
  }

  // TODO Pode ser feito uma única validação para evitar consultas excessivas ao banco.
  await _validateUniqueUsername(userInputValues.username);
  await _validateUniqueEmail(userInputValues.email);
  await _hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;
}

async function update(username, userInputValues) {
  async function runUpdateQuery(userWithNewValues) {
    const query = `
UPDATE 
  users
SET
  username = $2,
  email = $3,
  password = $4,
  updated_at = timezone('utc', now())
WHERE
  id = $1
RETURNING *
;`;
    const results = await database.query({
      text: query,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    });

    return results.rows[0];
  }

  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    if (
      currentUser.username.toLowerCase() !==
      userInputValues.username.toLowerCase()
    ) {
      await _validateUniqueUsername(userInputValues.username);
    }
  }

  if ("email" in userInputValues) {
    await _validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await _hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithNewValues);

  return updatedUser;
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
      action: "Utilize outro email para realizar esta operação.",
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
      action: "Utilize outro nome para realizar esta operação.",
    });
  }
}

async function _hashPasswordInObject(request) {
  const hashedPassword = await password.hash(request.password);
  request.password = hashedPassword; // Não é uma boa prática
}

const user = {
  findOneByUsername,
  findOneByEmail,
  create,
  update,
};

export default user;
