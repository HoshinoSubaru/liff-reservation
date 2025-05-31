/***************************************
 * ページ振り分け用
 ***************************************/
function doGet(e) {
  Logger.log("e.parameter: " + JSON.stringify(e.parameter));
  const params = e.parameter;
  const lineId = params.uid || "LINE_ID_None";  // ← iframeから来るパラメータ名に合わせた
  const name = params.name || "name_None";
  const mode = params.mode || "mode_None";
  const page = params.page;

  Logger.log("✅ userId: " + lineId);
  Logger.log("✅ name: " + name);
  Logger.log("✅ mode: " + mode);
  Logger.log("✅ page: " + page);

  try {
    testInsertEocLine(lineId);
    sendChatMessage("GAS LINE IDの取得: " + lineId);
  } catch (err) {
    Logger.log("sendChatMessage エラー: " + err.message);
  }

  let tmpl;
  if (page === 'reserve_personal') {
    tmpl = HtmlService.createTemplateFromFile("resource/views/reserve_personal");
  } else {
    tmpl = HtmlService.createTemplateFromFile("reserve_date");
  }

  tmpl.lineId = lineId;
  tmpl.name = name;
  tmpl.redirectUrl = ScriptApp.getService().getUrl();

  return tmpl.evaluate().setTitle(
    page === 'reserve_personal' ? "個人情報入力" : "日時選択"
  );
}

