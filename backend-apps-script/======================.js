
function testDashboardController() {
  const result = Router.dispatch("dashboard.summary", {
    NBM: "1110"
  });

  Logger.log(JSON.stringify(result, null, 2));
}
