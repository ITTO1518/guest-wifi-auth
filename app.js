async function runTest() {

  const log = document.getElementById("log");

  try {

    log.textContent += "接続一覧取得開始\n";

    const res = await fetch(
      "http://192.168.2.1/cgi-bin/luci/menu/lan-settings?apply=list"
    );

    const html = await res.text();

    log.textContent += "取得成功\n";
    log.textContent += html.substring(0, 1000);

  } catch (e) {

    log.textContent += "\nERROR\n";
    log.textContent += e;

  }

}
