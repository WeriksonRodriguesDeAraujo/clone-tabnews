function status(request, response) {
  response.status(200).json({ chave: "Messagem recebida com sucesso" });
}

export default status;