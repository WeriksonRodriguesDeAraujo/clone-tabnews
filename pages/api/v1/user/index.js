import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import session from "models/session.js";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const token = request.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(token);
  const userObject = await user.findOneById(sessionObject.user_id);

  await session.renew(sessionObject.id);
  controller.setSessionCookie(sessionObject.token, response);

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );

  return response.status(200).json(userObject);
}
