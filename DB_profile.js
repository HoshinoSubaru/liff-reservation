/**
 * processLineProfile:
 *  LIFFから取得したプロフィール（displayName, userId 等）を受け取り、
 *  MySQLに対して既存データの存在チェックを行い、必要に応じてINSERTまたはUPDATEします。
 *
 * @param {Object} profile  LIFFから受け取ったプロフィールオブジェクト（例: { displayName: "...", userId: "..." }）
 * @return {String} 結果メッセージ（任意）
 */
function processLineProfile(profile) {
  // MySQL接続情報を設定（適宜変更してください）
  var dbUrl = 'jdbc:mysql://YOUR_DB_HOST:3306/YOUR_DATABASE?useSSL=false';
  var dbUser = 'YOUR_DB_USER';
  var dbPassword = 'YOUR_DB_PASSWORD';
  var conn;

  try {
    // MySQLへの接続
    conn = Jdbc.getConnection(dbUrl, dbUser, dbPassword);
    
    // ① 既存のデータがあるかチェックするためのSELECT文
    var selectQuery = 'SELECT username FROM yourProfileTable WHERE lineId = ?';
    var selectStmt = conn.prepareStatement(selectQuery);
    selectStmt.setString(1, profile.userId);
    
    var results = selectStmt.executeQuery();
    
    if (results.next()) {
      // 既存データあり → displayNameに変更があるかチェックし、必要ならUPDATE
      var currentUserName = results.getString('username');
      if (currentUserName !== profile.displayName) {
        var updateQuery = 'UPDATE yourProfileTable SET username = ? WHERE lineId = ?';
        var updateStmt = conn.prepareStatement(updateQuery);
        updateStmt.setString(1, profile.displayName);
        updateStmt.setString(2, profile.userId);
        var updateCount = updateStmt.executeUpdate();
        Logger.log("プロフィール更新件数: " + updateCount);
        updateStmt.close();
      } else {
        Logger.log("プロフィール情報に変更はありません。");
      }
    } else {
      // 既存データなし → INSERTで新規登録
      var insertQuery = 'INSERT INTO yourProfileTable (lineId, username) VALUES (?, ?)';
      var insertStmt = conn.prepareStatement(insertQuery);
      insertStmt.setString(1, profile.userId);
      insertStmt.setString(2, profile.displayName);
      var insertCount = insertStmt.executeUpdate();
      Logger.log("プロフィール新規登録件数: " + insertCount);
      insertStmt.close();
    }
    
    results.close();
    selectStmt.close();
    
    return "プロフィール処理完了";
    
  } catch (e) {
    Logger.log("プロフィール処理エラー: " + e);
    throw new Error("プロフィール処理に失敗しました。 " + e.message);
    
  } finally {
    if (conn) {
      conn.close();
    }
  }
}
