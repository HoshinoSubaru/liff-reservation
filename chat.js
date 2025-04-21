function sendChatMessage(message) {
  const webhookUrl = "https://chat.googleapis.com/v1/spaces/AAAAowAXTm4/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=rpyX9-0V79XzhWVjAdtz-RFizGuO7WRWImNImwkKY3o"; // ← 自分のWebhook URLに置き換え

  const payload = {
    text: message
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(webhookUrl, options);
}

function testchat(){
  sendChatMessage("test")
}