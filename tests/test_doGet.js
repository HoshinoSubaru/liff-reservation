
function test_doGet(path, uid, name) {
  // path, uid, name を parameters/parameter 両方に入れる
  const e = {
    parameter: {
      path: path,
      uid: uid,
      name: name
    },
    parameters: {
      path: [path],
      uid: [uid],
      name: [name]
    }
  };
  const result = doGet(e);
  console.log(`path: ${path}`);
  console.log(JSON.stringify(result, null, 2));
}

function alltest() {
  // テスト実行例
  test_doGet('profile', 'U001', 'プロフ太郎');
  test_doGet('reserve', 'U002', '予約花子');
  test_doGet('unknown', 'U003', '名無し三郎');
}


function test_doGet_personal() {
  e = {
    "queryString": "liff.state=%3FuserId%3DU289092dd41f867e0fa2a450ba29a0add%26name%3Dbpm999%26mode%3Dedit%26timestamp%3D1744979724392&liff.referrer=https%3A%2F%2Fhoshinosubaru.github.io%2Fliff-reservation%2Findex.html%3Ftest%3D2",
    "parameters": {
      "liff.referrer": [
        "https://hoshinosubaru.github.io/liff-reservation/index.html?test=2"
      ],
      "liff.state": [
        "?userId=U289092dd41f867e0fa2a450ba29a0add&name=bpm999&mode=edit&timestamp=1744979724392"
      ]
    },
    "contextPath": "",
    "contentLength": -1,
    "parameter": {
      "liff.state": "?userId=U289092dd41f867e0fa2a450ba29a0add&name=bpm999&mode=edit&timestamp=1744979724392",
      "liff.referrer": "https://hoshinosubaru.github.io/liff-reservation/index.html?test=2"
    }
  };

  doGet(e)
}