/***************************************
 * カレンダーIDの指定
 ***************************************/
const CALENDAR_ID = "s.hoshino@urlounge.co.jp";

const defaultDate = "2025-03-25";  // テスト用日付
const defaultTime = "17:00";       // テスト用時間

let _LineID = ""
let _name = ""
let _mode = ""

/***************************************
 * ページ振り分け用
 ***************************************/
function doGet(e) {
  Logger.log("ScriptApp.getService().getUrl(): %s", ScriptApp.getService().getUrl());
  Logger.log(JSON.stringify(e))
  Logger.log("e.parameter: " + JSON.stringify(e.parameter));
  const page = e.parameter.page;

  // ローカル変数は削除
  // let userId = "";
  // let name = "";
  // let mode = "";

if (e.parameter["liff.state"]) {
  try {
    const rawState = e.parameter["liff.state"]; // 例: "?userId=...&name=...&mode=..."
    const decoded = decodeURIComponent(rawState);
    const query = decoded.startsWith("?") ? decoded.substring(1) : decoded;
    const paramMap = {};
    query.split("&").forEach(kv => {
      const [key, value] = kv.split("=");
      paramMap[key] = decodeURIComponent(value || "");
    });
    _LineID = paramMap.userId || "LINE_ID_None";
    _name = paramMap.name || "name_None";
    _mode = paramMap.mode || "mode_None";

    if (!_LineID || !_name) {
      throw new Error("liff.state に必要なパラメータが不足しています。");
    }
  } catch (err) {
    Logger.log("liff.state の解析に失敗しました: " + err.message);
    throw new Error("liff.state の解析に失敗しました。");
  }
} else 
  // liff.state パラメータがある場合はそちらから解析
  if (e.parameter["liff.state"]) {
    const rawState = e.parameter["liff.state"]; // 例: "?userId=...&name=...&mode=..."
    const decoded = decodeURIComponent(rawState);
    const query = decoded.startsWith("?") ? decoded.substring(1) : decoded;
    const paramMap = {};
    query.split("&").forEach(kv => {
      const [key, value] = kv.split("=");
      paramMap[key] = decodeURIComponent(value);
    });
    _LineID = paramMap.userId;
    _name = paramMap.name;
    _mode = paramMap.mode;
  } 
  /*
  // liff.state がない場合、直接 e.parameter から取得
  else if (e.parameter.line_id) {
    _LineID = e.parameter.line_id;
    _name = e.parameter.name || "";
    _mode = e.parameter.mode || "";
  } else {
    // パラメータが全く無い場合のフォールバック（必要ならデフォルト値を設定）
    _LineID = "LINE_ID_None";  
    _name = "name_None";
    _mode = "mode_None";
  }
    */
  
  // グローバル変数に代入
  //_LineID = lineId;
  //_name = name;
  //_mode = mode;

  Logger.log("✅ userId: " + _LineID);
  Logger.log("✅ name: " + _name);
  Logger.log("✅ mode: " + _mode);
  
  // DB のテスト登録（受け取った _LineID を使っている例）
  testInsertEocLine(_LineID);
  try {
    sendChatMessage("最初のページ " + _LineID);
  } catch (e) {
    Logger.log("sendChatMessage エラー:" + e.message);
  }

  let tmpl;
  if (page === 'reserve_personal') {
    tmpl = HtmlService.createTemplateFromFile("reserve_personal");
    if (e.parameter.line_id) {
      _LineID = e.parameter.line_id;
      _name = e.parameter.name;
    }
    try {
      sendChatMessage("2ページ目 GAS LINE IDの取得 " + _LineID);
    } catch (e) {}
  } else {
    //reserve_dateの表示
    
    tmpl = HtmlService.createTemplateFromFile("reserve_date");
    tmpl.lineId = _LineID
    tmpl.name = _name
    tmpl.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
    try {
      sendChatMessage("最初のページ " + _LineID);
    } catch (e) {}
  }
  
  tmpl.redirectUrl = ScriptApp.getService().getUrl(); // リダイレクトURL
  tmpl.lineId = _LineID || "lineId_none"//e.parameter.line_id || "LINE_ID_None"; // LINE ID
  tmpl.name = _name || "name_None"; // 名前
  return tmpl.evaluate().setTitle("日時選択");
}

/***************************************
 * テンプレート内で
 * <?!= include("xxx") ?> を使うためのヘルパー
 ***************************************/
function include(filename) {
  Logger.log("✅ filename: " + filename);
  
  Logger.log("✅ _LineID: " + _LineID);
  Logger.log("✅ name: " + _name);
  Logger.log("✅ mode: " + _mode);
  const tmpl = HtmlService.createTemplateFromFile(filename);
  tmpl.lineId = _LineID
  tmpl.lineid = _LineID
  
  tmpl._LineID = _LineID
  
  tmpl.name = _name
  tmpl._name = _name
  
  tmpl.redirectUrl = ScriptApp.getService().getUrl();
  Logger.log(tmpl)
  return tmpl.evaluate().getContent();
}

/***************************************
 * getEvents: カレンダーからイベントを取得
 * 終日イベントは除外
 ***************************************/
function getEvents() {
  const timeMin = new Date();
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 60);

  const optionalArgs = {
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    showDeleted: false,
    singleEvents: true,
    orderBy: "startTime"
  };

  const events = Calendar.Events.list(CALENDAR_ID, optionalArgs);

  if (!events.items || events.items.length === 0) {
    Logger.log("No events found in the specified period.");
    return [];
  }

  // Filter and map events
  return events.items
    .filter(isNotAllDayEvent)
    .map(formatEvent);
}

// Helper function to filter out all-day events
function isNotAllDayEvent(event) {
  const isAllDay = !event.start.dateTime && !event.end.dateTime;
  if (isAllDay) {
    Logger.log(`終日イベントを除外: ${event.summary}`);
  }
  return !isAllDay;
}

// Helper function to format event data
function formatEvent(event) {
  const start = event.start.dateTime || event.start.date;
  const end = event.end.dateTime || event.end.date;
  return {
    id: event.id,
    summary: event.summary || "無題のイベント",
    start: start,
    end: end
  };
}

/***************************************
 * submitReservationToSheet: GSSへの転記処理
 ***************************************/
function submitReservationToSheet(reservationData) {
  Logger.log("Received reservation data:", reservationData);

  try {
    // スプレッドシートを取得
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1DW_31Sf8RVlbIVN-iZ_C6QjGcuXPhvXuff60-EVGYeE/edit";
    const ss = SpreadsheetApp.openByUrl(spreadsheetUrl);
    const sheet = ss.getSheetByName("アプリ予約");
    if (!sheet) {
      throw new Error("予約データ シートが見つかりません。");
    }

    const timestampColumn = 1;  // A列 (タイムスタンプ)
    const dateColumn = 2;       // B列 (日付)
    const timeColumn = 3;       // C列 (時間)
    const lineNameColumn = 4;   // D列 (LINE名)
    const lineIdColumn = 5;     // E列 (LINE ID)
    const purposeColumn = 6;    // F列 (用件)
    const staffColumn = 7;      // G列 (スタッフ)
    const usageColumn = 8;      // H列 (利用回数)

    // 次の空行を取得
    const lastRow = sheet.getLastRow() + 1;

    // 空の場合はテスト値を使用
    const selectedDate = reservationData.time ? reservationData.time.split(" ")[0] : defaultDate;  // "YYYY-MM-DD"
    const selectedTime = reservationData.time ? reservationData.time.split(" ")[1] : defaultTime;  // "HH:MM"

    sheet.getRange(lastRow, timestampColumn).setValue(new Date());
    sheet.getRange(lastRow, dateColumn).setValue(selectedDate);
    sheet.getRange(lastRow, timeColumn).setValue(selectedTime);
    sheet.getRange(lastRow, lineNameColumn).setValue(reservationData.lineName);
    sheet.getRange(lastRow, lineIdColumn).setValue(reservationData.lineId);
    sheet.getRange(lastRow, purposeColumn).setValue(reservationData.purpose);
    sheet.getRange(lastRow, staffColumn).setValue(reservationData.staff);
    sheet.getRange(lastRow, usageColumn).setValue(reservationData.usage);

    const calendarEventId = addCalendarEvent(reservationData);
    Logger.log("Calendar Event created with ID: " + calendarEventId);
    sendLinePushNotification(reservationData, calendarEventId);
    return calendarEventId;
    
  } catch (err) {
    Logger.log("Error details: " + err.message);
    Logger.log("Stack trace: " + err.stack);
    throw new Error("予約処理に失敗しました。もう一度お試しください。詳細: " + err.message);
  }
}

/***************************************
 * addCalendarEvent: カレンダーに新規イベント作成  
 * LINE予約の場合は、LINEの表示名とIDをタイトルに含める
 ***************************************/
function addCalendarEvent(reservationData) {
  // 日時設定（空の場合はテスト値を使用）
  const dateTimeStr = reservationData.time
    ? reservationData.time.replace(" ", "T")
    : defaultDate + "T" + defaultTime;
  const startTime = new Date(dateTimeStr);
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 30);

  // タイトルには LINE 名のみを使用
  let displayName = reservationData.lineName;

  // イベントオブジェクトの作成
  const eventObj = {
    summary: `${reservationData.purpose}：LINE予約：${displayName}さま`,
    description: 
  `予約者名:${displayName}さま
  担当者希望: ${reservationData.staff || "未入力"}
  用途: ${reservationData.purpose || "なし"}
  来店回数: ${reservationData.usage || "未入力"}
  LINE ID: ${reservationData.lineId || "未入力"}`,
    location: "〒170-0013 東京都豊島区東池袋１丁目２５−１４ アルファビルディング 4F",
    start: {
      dateTime: startTime.toISOString(),
      timeZone: "Asia/Tokyo"
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: "Asia/Tokyo"
    }
  };

  Logger.log("Event Object: " + JSON.stringify(eventObj, null, 2));

  try {
    // イベントの新規作成
    const newEvent = Calendar.Events.insert(eventObj, CALENDAR_ID);
    Logger.log("Event created with ID: " + newEvent.id);

    // 招待するゲストリストの設定（主催者も含める場合）
    let requiredGuests = ["subaru6363natuko@gmail.com","s.hoshino@urlounge.co.jp"];
    requiredGuests.unshift(CALENDAR_ID);  // 主催者（カレンダーID）をゲストリストの先頭に追加

    Logger.log("招待するゲストリスト: " + requiredGuests.join(", "));

    // patch 更新用のイベントリソース
    const eventResource = {
      attendees: requiredGuests.map(email => ({ email: email }))
    };

    // patch 更新を実施して招待メール送信（sendUpdates: "all" を指定）
    Calendar.Events.patch(eventResource, CALENDAR_ID, newEvent.id, { sendUpdates: "all" });
    Logger.log("Google Calendar API による patch 更新と招待メール送信リクエスト完了");

    return newEvent.id;
  } catch (err) {
    Logger.log("Error creating or updating calendar event: " + err.message);
    throw new Error("カレンダーイベントの作成または招待メール送信に失敗しました: " + err.message);
  }
}

/***************************************
 * 予約完了時にLINE PUSH
 ***************************************/
function sendLinePushNotification(reservationData, calendarEventId) {
  // reservationDataから必要な変数を分割代入で取得
  const { /*lineId,*/ time, /*lineName,*/ staff, purpose, usage } = reservationData;

  // 送信先: LIFFで取得したユーザーIDを利用
  const to = _LineID;
  
// "time" を日付と時間に分割（例："2025-03-25 17:00"）
  const [reservationDate, reservationTime] = time.split(" ");
 
  // LINE Messaging API のエンドポイント
  const url = "https://api.line.me/v2/bot/message/push";
  // チャネルアクセストークン
  const accessToken = "nyiXxhIRpD5Z8AeLsRp2nHcfYN9PmptLWjJYQPQT/OVA4WGtgbe4krfRG+CUmwnfqw9VzMqpc48n2N84WcQuEV6lgGTLfWqHwkhWrZKxZ9yFevUYDmYpjk2RVHg9xp+ob9vWBer048e/C44FvqqupAdB04t89/1O/w1cDnyilFU="; // セキュアに管理してください

  // 送信するメッセージの内容
  const messageText =
    "ご予約が完了いたしました📆✨\n\n" +
    "スタッフ一同、心よりお待ち申しております。\n" +
    "店舗アクセスマップ  https://shorturl.at/haqMf  \n" +
    "（※Googleマップが開きます）\n\n" +
    "📅 ご予約内容\n" +
    "予約日: " + reservationDate + "\n" +
    "時間: " + reservationTime + "\n" +
    "ご予約者名: " + _name + "\n" +
    "用件: " + purpose + "\n" +
    "担当者: " + staff + "\n" +
    "ご利用回数: " + usage + "\n\n" +
    "その他、お困りごとはございましたでしょうか。";
    
  const payload = {
    to: to,
    messages: [
      {
        type: "text",
        text: messageText
      }
    ]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + accessToken
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  // APIリクエスト実行
  const response = UrlFetchApp.fetch(url, options);
  Logger.log("LINE PUSH response: " + response.getContentText());
  return response.getContentText();
}