import { InternalServerError, MethodNotAllowedError } from "infra/errors.js";

function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.error(publicErrorObject);
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onNoMatchhandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();

  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchhandler,
    onError: onErrorHandler,
  },
};

export default controller;
