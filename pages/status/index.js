import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);

  return await response.json();
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <DatabaseStatus />
    </>
  );
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let databaseStatusInformation = <h3>Carregando...</h3>;

  if (!isLoading && data) {
    const dateTime = new Date(data.updated_at).toLocaleString("pt-BR");
    const { dependencies } = data.database;

    databaseStatusInformation = (
      <>
        <h3>Última atualização: {dateTime}</h3>
        <h3>Versão do banco de dados: PostgreSQL {dependencies.version}</h3>
        <h3>Conexões ativas: {dependencies.active_conections}</h3>
        <h3>Limite de conexões: {dependencies.max_conections}</h3>
      </>
    );
  }

  return databaseStatusInformation;
}
