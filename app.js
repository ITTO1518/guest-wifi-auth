const GAS_URL = "https://script.google.com/macros/s/AKfycbw8u-H9rHggXgKO4rCh5UdQhWo7mRQCR_pvRkRz-vecu1cSbLtZSRL3WBXjllejxPw7/exec";

const codeInput = document.getElementById("codeInput");
const emailInput = document.getElementById("emailInput");
const message = document.getElementById("message");
const debugLog = document.getElementById("debugLog");

const checkBtn = document.getElementById("checkBtn");
const startBtn = document.getElementById("startBtn");
const registerBtn = document.getElementById("registerBtn");

window.addEventListener("load", () => {
  const savedCode = localStorage.getItem("guest_wifi_code");

  log("page loaded");

  if (savedCode) {
    codeInput.value = savedCode;
    log("saved code found: " + savedCode);
    checkInfo();
  }
});

checkBtn.addEventListener("click", checkInfo);
startBtn.addEventListener("click", startUsage);
registerBtn.addEventListener("click", registerCode);

async function registerCode() {
  const email = emailInput.value.trim();

  if (!email) {
    showMessage("メールアドレスを入力してください。", true);
    return;
  }

  setLoading(true);
  log("register start: " + email);

  try {
    const data = await callApi({
      action: "register",
      email: email
    });

    log("register response: " + JSON.stringify(data));

    if (!data.success) {
      showMessage(data.message || "コード発行に失敗しました。", true);
      return;
    }

    showMessage(
      "利用コードをメールで送信しました。\nメールに届いた GWF-XXXXXX を入力してください。",
      false
    );

  } catch (e) {
    log("register error: " + e);
    showMessage("通信エラーが発生しました。", true);
  } finally {
    setLoading(false);
  }
}

async function checkInfo() {
  const code = normalizeCode(codeInput.value);

  if (!code) {
    showMessage("利用コードを入力してください。", true);
    return;
  }

  setLoading(true);
  log("info start: " + code);

  try {
    const data = await callApi({
      action: "info",
      code: code
    });

    log("info response: " + JSON.stringify(data));

    if (!data.success) {
      showMessage(data.message || "利用コードが無効です。", true);
      return;
    }

    localStorage.setItem("guest_wifi_code", code);

    showMessage(
      "本日の利用回数：" + data.used + "回\n" +
      "本日の残り回数：" + data.remain + "回",
      !data.allowed
    );

  } catch (e) {
    log("info error: " + e);
    showMessage("通信エラーが発生しました。", true);
  } finally {
    setLoading(false);
  }
}

async function startUsage() {
  const code = normalizeCode(codeInput.value);

  if (!code) {
    showMessage("利用コードを入力してください。", true);
    return;
  }

  setLoading(true);
  log("start usage: " + code);

  try {
    const data = await callApi({
      action: "start",
      code: code
    });

    log("start response: " + JSON.stringify(data));

    if (!data.success) {
      showMessage(data.message || "利用開始に失敗しました。", true);
      return;
    }

    localStorage.setItem("guest_wifi_code", code);

    if (!data.allowed) {
      showMessage(
        "本日の利用上限に達しました。\n明日以降に再度ご利用ください。",
        true
      );
      return;
    }

    showMessage(
      "利用開始しました。\n" +
      "60分後に再認証が必要です。\n" +
      "本日の残り回数：" + data.remain + "回",
      false
    );

  } catch (e) {
    log("start error: " + e);
    showMessage("通信エラーが発生しました。", true);
  } finally {
    setLoading(false);
  }
}

async function callApi(params) {
  const url = GAS_URL + "?" + new URLSearchParams(params).toString();

  log("fetch: " + url);

  const res = await fetch(url);
  const text = await res.text();

  log("raw response: " + text);

  return JSON.parse(text);
}

function normalizeCode(code) {
  return code.trim().toUpperCase();
}

function showMessage(text, isError) {
  message.textContent = text;
  message.style.color = isError ? "#c62828" : "#1b5e20";
}

function setLoading(loading) {
  checkBtn.disabled = loading;
  startBtn.disabled = loading;
  registerBtn.disabled = loading;
}

function log(text) {
  const now = new Date().toLocaleString();
  debugLog.textContent += "[" + now + "] " + text + "\n";
}
