function test_processLineProfile_cases() {
  sendErrorToGoogleChat("GAS 顧客データテスト")
  // テスト①: 規定値の代入が働くか
  res = processLineProfile({ userId: "", displayName: "" });
  sendErrorToGoogleChat("GAS 顧客データテスト"+res)
  // テスト②: 新規登録（想定userIdでDBにまだ存在しない）
  processLineProfile({ userId: "test_user_001", displayName: "テスト太郎" });

  // テスト③: 既に存在するが名前が違う（UPDATE）
  processLineProfile({ userId: "test_user_001", displayName: "テスト太郎・更新版" });

  // テスト④: 名前もIDも同じ（変更なし）
  processLineProfile({ userId: "test_user_001", displayName: "テスト太郎・更新版" });
}

function testInsertEocLine(line_id = "testDB:SU", line_name = "テストDB:名前") {
  const conn = getConnection();
  const stmt = conn.prepareStatement(
    //'INSERT INTO Eoc_line (line_id, line_name) VALUES ("'+line_id+'", "'+line_name+'")' // カラム名は実際のテーブルに合わせて
      'INSERT INTO Eoc_line (line_id, line_name) VALUES (?,?)' // カラム名は実際のテーブルに合わせて
  );

  //stmt.setInt(1, 999);                            // id
  stmt.setString(1, line_id);              // name
  stmt.setString(2, line_name);        // created_at

  stmt.execute();
  stmt.close();
  conn.close();

  Logger.log('1件INSERTしました: ' + line_id + ' / ' + line_name);
}


/**
 * スクリプトのプロパティからDB接続情報を取得
 * @return {Object} 接続情報（DB_CONNECTION, DB_HOST, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD）
 */
function getDbConfig() {
  const scriptProps = PropertiesService.getScriptProperties();
  return {
    connection: scriptProps.getProperty("DB_CONNECTION"),   // 例: "mysql"
    host: scriptProps.getProperty("DB_HOST"),               // 例: "35.213.86.XX"
    port: scriptProps.getProperty("DB_PORT"),               // 例: "3306"
    database: scriptProps.getProperty("DB_DATABASE"),       // 例: "yourDatabaseName"
    user: scriptProps.getProperty("DB_USER"),               // 例: "yourUserName"
    password: scriptProps.getProperty("DB_PASSWORD")        // 例: "yourPassword"
  };
}

/**
 * プロパティから取得した情報をもとに、JDBC接続用のURLを生成して接続を返します
 * @return {JdbcConnection} MySQL接続オブジェクト
 */
function getConnection() {
  const config = getDbConfig();
  // 例: "jdbc:mysql://ホスト:ポート/データベース?useSSL=false"
  const url = `jdbc:${config.connection}://${config.host}:${config.port}/${config.database}?useSSL=false`;
  Logger.log(url)
  Logger.log(config.user)
  Logger.log(config.password)
  return Jdbc.getConnection(url, config.user, config.password);
}

function testQuery() {
  const conn = getConnection();
  const stmt = conn.createStatement();
  const rs = stmt.executeQuery('SELECT * FROM Eoc_line LIMIT 10');

  while (rs.next()) {
    Logger.log(rs.getString(1)); // 1列目の値を表示（列名でもOK）
    //Console.log(rs.getString(1))
  }
  
  rs.close();
  stmt.close();
  conn.close();
}

/**
 * Google Chat へエラーメッセージを送信する関数
 * @param {string} errorMessage - 送信するエラーメッセージの内容
 */
function sendErrorToGoogleChat(errorMessage) {
  try {
    sendChatMessage("【GAS MySQL接続エラー】\n" + errorMessage);
  } catch (e) {
    Logger.log("Google Chat への送信エラー: " + e.message);
  }
}

function sendSuccessToGoogleChat(successMessage) {
  try {
    sendChatMessage("【GAS MySQL登録成功】\n" + successMessage);
  } catch (e) {
    Logger.log("Google Chat への送信エラー: " + e.message);
  }
}


/**
 * processLineProfile:
 * LIFFから取得したプロフィール（displayName, userId 等）を受け取り、
 * MySQLのテーブル「Eoc_line」に対して既存データの存在チェックを行い、
 * 必要に応じてINSERTまたはUPDATEします。
 *
 * ※もし、profile.userId や profile.displayName が "None" または空の場合、
 *    規定値として userId を "test_hoshino"、displayName を "Hoshinoテスト" に上書きします。
 *
 * @param {Object} profile  LIFFから受け取ったプロフィールオブジェクト（例: { displayName: "...", userId: "..." }）
 * @return {String} 結果メッセージ（任意）
 */
function processLineProfile(profile) {
    Logger.log("Received profile: " + JSON.stringify(profile));

  if (!profile.userId || !profile.displayName) {
    throw new Error("プロフィール情報が不足しています。userId または displayName が空です。");
  }

  /*  // 規定値の設定
    if (!profile.userId || profile.userId === "None") {
    profile.userId = "test_hoshino";
    }
    if (!profile.displayName || profile.displayName === "None") {
      profile.displayName = "Hoshinoテスト";
    }
  */
  
  let conn = null;
  try {
    // プロパティサービスから取得した接続情報でMySQLに接続
    conn = getConnection();
    Logger.log(conn)
    
    // 既存のデータがあるかチェックするためのSELECT文（キーは line_id）
    const selectQuery = 'SELECT line_name FROM Eoc_line WHERE line_id = ?';
    const selectStmt = conn.prepareStatement(selectQuery);
    selectStmt.setString(1, profile.userId);
    const results = selectStmt.executeQuery();
    
    if (results.next()) {
      // 既存データがある場合 → line_name の変更をチェックし、必要なら UPDATE を実行
      const currentUserName = results.getString('line_name');
      if (currentUserName !== profile.displayName) {
        const updateQuery = 'UPDATE Eoc_line SET line_name = ? WHERE line_id = ?';
        const updateStmt = conn.prepareStatement(updateQuery);
        updateStmt.setString(1, profile.displayName);
        updateStmt.setString(2, profile.userId);
        const updateCount = updateStmt.executeUpdate();
        Logger.log("プロフィール更新件数: " + updateCount);
        updateStmt.close();
      } else {
        Logger.log("プロフィール情報に変更はありません。");
      }
    } else {
      // 既存データなし → INSERTで新規登録
      const insertQuery = 'INSERT INTO Eoc_line (line_id, line_name) VALUES (?, ?)';
      const insertStmt = conn.prepareStatement(insertQuery);
      insertStmt.setString(1, profile.userId);
      insertStmt.setString(2, profile.displayName);
      const insertCount = insertStmt.executeUpdate();
      Logger.log("プロフィール新規登録件数: " + insertCount);
      insertStmt.close();
    }
    
    results.close();
    selectStmt.close();
    
    // 成功時にGoogle Chatへ通知（line_idとline_name情報を送信）
    var successMessage = "DB登録成功\nline_id: " + profile.userId + "\nline_name: " + profile.displayName;
    sendSuccessToGoogleChat(successMessage);

    return "GAS⇒DBプロフィール処理完了";
    
  } catch (e) {
    Logger.log("GAS⇒DBプロフィール処理エラー: " + e);
    // エラーが発生した場合、Google Chat にエラー内容を通知する
    sendErrorToGoogleChat(e.message);
    throw new Error("GAS⇒DBプロフィール処理に失敗しました。 " + e.message);
    
  } finally {
    if (conn) {
      conn.close();
    }
  }
}
