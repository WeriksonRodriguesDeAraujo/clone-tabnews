import { 
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError
} from "infra/errors.js";

function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    console.error(error);
    response.status(error.statusCode).json(error);
  };

  const publicErrorObject = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
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
