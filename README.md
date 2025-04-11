# liff-reservation✅各ファイルの役割 & 記述例
## 1️⃣ docs/index.html（LINE SDK）  
- GAS/javascript上ではLINESDKからの情報が取得できないため、GITHUB PAGES(正式なURL発行)で設定

## 2️⃣ page.html（Webページ）  
📌 役割
- <include> を使って style.css.html（CSS）と reserve_script.js.html（JavaScript）を読み込む
- ページリンクはiframeでないとできない
- 予約フォームを作成
- html

## 3️⃣ reserve_script.gs（サーバーサイド/GAS）  
📌 役割
- 「データ取得」「データ保存」など、データ処理のロジックを担当
- index.html を表示
- CSSとJSを読み込む
- 必要なデータを doGet() で提供（APIとしてデータを返す）
- javascript
- Googleアカウントと連携して動作し、カレンダーやスプレッドシートなど、機密情報にアクセス可能です。
- このコードをクライアント側に置くと、不特定多数のユーザーに情報が漏れる恐れがあります。

## 4️⃣ reserve_script.js.html（クライアントサイドJavaScript）  
📌 役割
- 「表示」や「操作」に関するコード
- fetchEvents() を使って doGet() のAPIから予約可能日を取得
- flatpickr を使ってカレンダーに予約可能日を設定
- generateTimeSlots() で時間選択ボタンを作成
- submitReservation() でフォームを処理
- ユーザー側（ブラウザ）で動くため、機密情報を持たない

## 45️⃣ style.css.html（スタイルシート/CSS）  
📌 役割
- デザインを適用（ボタンのスタイル、フォームの配置など）
