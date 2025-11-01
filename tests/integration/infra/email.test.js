import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    const mailConfigs = {
      from: "CloneTabnews <cloneTabnews@gmail.com>",
      to: "<contato@curso.dev>",
    };

    await email.send({
      from: mailConfigs.from,
      to: mailConfigs.to,
      subject: "Texto de assunto",
      text: "Texto de corpo",
    });

    await email.send({
      from: mailConfigs.from,
      to: mailConfigs.to,
      subject: "Texto de assunto do último email",
      text: "Texto de corpo do último email",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(mailConfigs.from.includes(lastEmail.sender)).toBeTruthy();
    expect(lastEmail.recipients[0]).toBe(mailConfigs.to);
    expect(lastEmail.subject).toBe("Texto de assunto do último email");
    expect(lastEmail.text).toBe("Texto de corpo do último email\r\n");
  });
});
