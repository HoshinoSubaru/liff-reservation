

function test_doGet() {
  // reserve_personal.html テンプレートのパスが resources/views/ であることをテスト
  const e = {
    contentLength: -1,
    contextPath: "",
    parameters: {
      "liff.referrer": ["https://hoshinosubaru.github.io/liff-reservation/index.html?test=2"],
      "liff.state": ["?userId=U289092dd41f867e0fa2a450ba29a0add&name=bpm999&mode=edit&timestamp=1744968712351"],
      "path": ["reserve"]
    },
    parameter: {
      "liff.referrer": "https://hoshinosubaru.github.io/liff-reservation/index.html?test=2",
      "liff.state": "?userId=U289092dd41f867e0fa2a450ba29a0add&name=bpm999&mode=edit&timestamp=1744968712351",
      "path": "reserve"
    },
    queryString: "liff.state=%3FuserId%3DU289092dd41f867e0fa2a450ba29a0add%26name%3Dbpm999%26mode%3Dedit%26timestamp%3D1744968712351&liff.referrer=https%3A%2F%2Fhoshinosubaru.github.io%2Fliff-reservation%2Findex.html%3Ftest%3D2&path=reserve"
  };
  // テンプレートパスが正しいか確認
  const result = doGet(e);
  // result.getContent() などで内容を検証することも可能
  Logger.log(result);
}




function test_doGet_personal() {
  // reserve_date.html テンプレートのパスが resources/views/ であることをテスト
  const e = {
    contentLength: -1,
    contextPath: "",
    parameters: {
      "liff.referrer": ["https://hoshinosubaru.github.io/liff-reservation/index.html?test=2"],
      "liff.state": ["?userId=U289092dd41f867e0fa2a450ba29a0add&name=bpm999&mode=edit&timestamp=1744979724392"],
      "path": ["profile"]
    },
    parameter: {
      "liff.state": "?userId=U289092dd41f867e0fa2a450ba29a0add&name=bpm999&mode=edit&timestamp=1744979724392",
      "liff.referrer": "https://hoshinosubaru.github.io/liff-reservation/index.html?test=2",
      "path": "profile"
    },
    queryString: "liff.state=%3FuserId%3DU289092dd41f867e0fa2a450ba29a0add%26name%3Dbpm999%26mode%3Dedit%26timestamp%3D1744979724392&liff.referrer=https%3A%2F%2Fhoshinosubaru.github.io%2Fliff-reservation%2Findex.html%3Ftest%3D2&path=profile"
  };
  // テンプレートパスが正しいか確認
  const result = doGet(e);
  Logger.log(result);
}