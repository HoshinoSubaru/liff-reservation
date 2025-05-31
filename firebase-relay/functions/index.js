/*
const functions = require("firebase-functions");
const fetch = require("node-fetch");

exports.relayToGAS = functions.https.onRequest(async (req, res) => {
  const { uid, name, page } = req.body;

  const gasUrl = "https://script.google.com/a/macros/urlounge.co.jp/s/AKfycbxVP33NxiZRi_rIXzXRaN5-wNmVEVeFCQzPXnDdM4oxaF6MzuILwkDwNMEKTNm8V11Tdw/exec";
  const fullUrl = `${gasUrl}?uid=${encodeURIComponent(uid)}&name=${encodeURIComponent(name)}&page=${encodeURIComponent(page)}`;

  try {
    const response = await fetch(fullUrl);
    const html = await response.text();
    res.status(200).send(html);
  } catch (err) {
    console.error("GAS呼び出しエラー:", err);
    res.status(500).send("GASへのリクエストに失敗しました");
  }
});
*/