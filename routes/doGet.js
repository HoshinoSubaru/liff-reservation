/***************************************
 * ページ振り分け用
 ***************************************/
function doGet(e) {
  Logger.log("e.parameter: " + JSON.stringify(e.parameter));
  const params = e.parameter;
  const path = params.path || '';
  switch (path) {
    case 'profile':
      return handleProfile(params);
    case 'reserve':
      return handleReserve(params);
    default:
      return handleHome(params);
  }
}

function handleProfile(params) {
  // プロフィール取得処理例
  return ContentService.createTextOutput('プロフィールページ');
}

function handleReserve(params) {
  // 予約ページ表示例
  let tmpl = HtmlService.createTemplateFromFile("resources/views/reserve_personal");
  tmpl.lineId = params.uid || "LINE_ID_None";
  tmpl.name = params.name || "name_None";
  tmpl.redirectUrl = ScriptApp.getService().getUrl();
  res = tmpl.evaluate().setTitle("個人情報入力");
  Logger.log(res.getContent())
  return res
}

function handleHome(params) {
  // デフォルトページ（日時選択）
  let tmpl = HtmlService.createTemplateFromFile("resources/views/reserve_date");
  tmpl.lineId = params.uid || "LINE_ID_None";
  tmpl.name = params.name || "name_None";
  tmpl.redirectUrl = ScriptApp.getService().getUrl();
  res = tmpl.evaluate().setTitle("日時選択");
  Logger.log(res.getContent())
  return res
}

