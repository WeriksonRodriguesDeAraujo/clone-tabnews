const { exec } = require("node:child_process");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      console.log("Não está aceitando conexões ainda.");
      setTimeout(() => checkPostgres(), 3000);
      return;
    }

    console.log("🟢 Postgres está pronto e está aceitando conexões.\n");
  }
}

console.log("🔴 Aguardando o postgres aceitar conexões.");
checkPostgres();
