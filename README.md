# liff-reservation✅各ファイルの役割 & 記述例
## Laravelディレクトリ構成の説明

このプロジェクトはLaravelの標準的なディレクトリ構成に従って整理されています。各ディレクトリの主な役割は以下の通りです。

### /app
アプリケーションのコアロジックを格納します。コントローラー、モデル、サービスなどが含まれます。

### /app/Services/FirebaseRelay
Firebase連携など外部サービスとのやりとり用のロジックを配置します。

### /bootstrap
フレームワークの起動や初期設定ファイルを格納します。

### /config
アプリケーションの各種設定ファイルを格納します。

### /database
マイグレーションやシーディングなど、データベース関連のファイルを格納します。

### /public
公開ディレクトリ。JavaScriptやCSS、画像などWebサーバーから直接アクセスされる静的ファイルを配置します。
例: `public/js/`, `public/css/`

### /resources/views
Bladeテンプレート（HTMLビュー）を格納します。ユーザーに表示される画面のレイアウトやパーツを記述します。

### /resources/docs
ドキュメントや参考資料などを格納します。

### /routes
ルーティング定義ファイルを格納します。

### /storage
ログやキャッシュ、一時ファイルなどを格納します。

### /tests
テストコードを格納します。

### /vendor
Composerでインストールした外部パッケージが格納されます。

---
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
