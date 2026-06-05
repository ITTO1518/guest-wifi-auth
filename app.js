const GAS_URL =
  "https://script.google.com/macros/s/AKfycbw8u-H9rHggXgKO4rCh5UdQhWo7mRQCR_pvRkRz-vecu1cSbLtZSRL3WBXjllejxPw7/exec";

/*************************************************
 DEBUG設定
 true  = Console出力
 false = 完全無効
*************************************************/
const DEBUG = true;

const codeInput = document.getElementById("codeInput");
const emailInput = document.getElementById("emailInput");
const message = document.getElementById("message");

const checkBtn = document.getElementById("checkBtn");
const startBtn = document.getElementById("startBtn");
const registerBtn = document.getElementById("registerBtn");

/*************************************************
 起動
*************************************************/
window.addEventListener("load", () => {

  log("==================================");
  log("Guest Wi-Fi Start");
  log("URL : " + window.location.href);
  log("==================================");

  const savedCode =
    localStorage.getItem("guest_wifi_code");

  if (savedCode) {

    log("Saved code found");
    log("Code : " + savedCode);

    codeInput.value = savedCode;

    checkInfo();
  }
});

/*************************************************
 イベント
*************************************************/
checkBtn.addEventListener(
  "click",
  checkInfo
);

startBtn.addEventListener(
  "click",
  startUsage
);

registerBtn.addEventListener(
  "click",
  registerCode
);

/*************************************************
 初回登録
*************************************************/
async function registerCode() {

  const email =
    emailInput.value.trim();

  log("----- REGISTER -----");
  log("Email : " + email);

  if (!email) {

    showMessage(
      "メールアドレスを入力してください。",
      true
    );

    log("Email empty");

    return;
  }

  setLoading(true);

  try {

    const data =
      await callApi({
        action: "register",
        email: email
      });

    log("Register Response");
    log(JSON.stringify(data));

    if (!data.success) {

      showMessage(
        data.message ||
        "コード発行に失敗しました。",
        true
      );

      return;
    }

    showMessage(
      "利用コードをメールで送信しました。\n" +
      "メールをご確認ください。",
      false
    );

  }
  catch (e) {

    console.error(e);

    showMessage(
      "通信エラーが発生しました。",
      true
    );

  }
  finally {

    setLoading(false);

  }
}

/*************************************************
 残回数確認
*************************************************/
async function checkInfo() {

  const code =
    normalizeCode(
      codeInput.value
    );

  log("----- INFO -----");
  log("Code : " + code);

  if (!code) {

    showMessage(
      "利用コードを入力してください。",
      true
    );

    return;
  }

  setLoading(true);

  try {

    const data =
      await callApi({
        action: "info",
        code: code
      });

    log("Info Response");
    log(JSON.stringify(data));

    if (!data.success) {

      showMessage(
        data.message ||
        "利用コードが無効です。",
        true
      );

      return;
    }

    localStorage.setItem(
      "guest_wifi_code",
      code
    );

    log("Code saved");

    showMessage(
      "本日の利用回数：" +
      data.used +
      "回\n" +
      "本日の残り回数：" +
      data.remain +
      "回",
      false
    );

  }
  catch (e) {

    console.error(e);

    showMessage(
      "通信エラーが発生しました。",
      true
    );

  }
  finally {

    setLoading(false);

  }
}

/*************************************************
 利用開始
*************************************************/
async function startUsage() {

  const code =
    normalizeCode(
      codeInput.value
    );

  log("----- START -----");
  log("Code : " + code);

  if (!code) {

    showMessage(
      "利用コードを入力してください。",
      true
    );

    return;
  }

  setLoading(true);

  try {

    const data =
      await callApi({
        action: "start",
        code: code
      });

    log("Start Response");
    log(JSON.stringify(data));

    if (!data.success) {

      showMessage(
        data.message ||
        "利用開始に失敗しました。",
        true
      );

      return;
    }

    localStorage.setItem(
      "guest_wifi_code",
      code
    );

    if (!data.allowed) {

      log("Daily limit reached");

      showMessage(
        "本日の利用上限に達しました。\n" +
        "明日以降に再度ご利用ください。",
        true
      );

      return;
    }

    showMessage(
      "利用開始しました。\n" +
      "60分後に再認証が必要です。\n" +
      "本日の残り回数：" +
      data.remain +
      "回",
      false
    );

  }
  catch (e) {

    console.error(e);

    showMessage(
      "通信エラーが発生しました。",
      true
    );

  }
  finally {

    setLoading(false);

  }
}

/*************************************************
 API呼び出し
*************************************************/
async function callApi(params) {

  const url =
    GAS_URL +
    "?" +
    new URLSearchParams(params);

  log("Fetch URL");
  log(url);

  const response =
    await fetch(url);

  log("HTTP Status");
  log(response.status);

  const text =
    await response.text();

  log("Raw Response");
  log(text);

  return JSON.parse(text);
}

/*************************************************
 共通
*************************************************/
function normalizeCode(code) {

  return String(code)
    .trim()
    .toUpperCase();

}

function showMessage(
  text,
  isError
) {

  message.textContent = text;

  message.style.color =
    isError
      ? "#c62828"
      : "#1b5e20";

}

function setLoading(
  loading
) {

  checkBtn.disabled =
    loading;

  startBtn.disabled =
    loading;

  registerBtn.disabled =
    loading;

}

/*************************************************
 Debug Log
 F12 → Console
*************************************************/
function log(text) {

  if (!DEBUG) return;

  const now =
    new Date()
      .toLocaleTimeString();

  console.log(
    "[GuestWiFi][" +
    now +
    "]",
    text
  );

}
