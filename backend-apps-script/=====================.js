function testTahunAjaranController() {

  const response = Router.dispatch(
    "tahunAjaran.aktif",
    {}
  );

  console.log(
    "Respons tahun ajaran:",
    JSON.stringify(response)
  );

}