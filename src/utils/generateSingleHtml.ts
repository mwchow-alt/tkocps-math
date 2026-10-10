export function getStandaloneHtmlCode(customGasUrl: string = ''): string {
  const defaultGasUrlPlaceholder = customGasUrl || 'https://script.google.com/macros/s/YOUR_GAS_DEPLOYMENT_ID/exec';

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>小學數學大冒險 - Google Sheet 連動版</title>
  <style>
    :root {
      --primary: #f59e0b;
      --primary-hover: #d97706;
      --primary-light: #fef3c7;
      --accent: #10b981;
      --danger: #ef4444;
      --text: #1e293b;
      --muted: #64748b;
      --bg: #fffbeb;
      --card-bg: #ffffff;
      --radius: 20px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Zen Maru Gothic", Arial, sans-serif;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .app-container {
      width: 100%;
      max-width: 540px;
      background: var(--card-bg);
      border-radius: var(--radius);
      box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 3px solid #fde68a;
      overflow: hidden;
      position: relative;
    }

    .header-bar {
      background: #fbbf24;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #78350f;
    }

    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .screen {
      padding: 28px 24px;
      display: none;
    }

    .screen.active {
      display: block;
      animation: fadeIn 0.25s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* 登入介面樣式 */
    .hero-badge {
      text-align: center;
      margin-bottom: 24px;
    }

    .hero-emoji {
      font-size: 56px;
      margin-bottom: 8px;
      display: inline-block;
    }

    .hero-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: #92400e;
    }

    .hero-subtitle {
      font-size: 0.9rem;
      color: var(--muted);
      margin-top: 4px;
    }

    .form-group {
      margin-bottom: 18px;
    }

    .form-label {
      display: block;
      font-weight: 700;
      font-size: 0.95rem;
      color: #78350f;
      margin-bottom: 6px;
    }

    .form-input {
      width: 100%;
      padding: 14px 16px;
      font-size: 1.1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      outline: none;
      transition: border-color 0.2s;
    }

    .form-input:focus {
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
    }

    .btn {
      width: 100%;
      padding: 16px;
      font-size: 1.15rem;
      font-weight: 800;
      color: white;
      background: var(--primary);
      border: none;
      border-radius: 14px;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.4);
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    .btn:active {
      transform: translateY(1px);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* 載入畫面 */
    .loading-box {
      text-align: center;
      padding: 40px 10px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 5px solid #fde68a;
      border-top-color: #f59e0b;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* 數學練習區樣式 */
    .practice-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .student-tag {
      font-size: 0.95rem;
      font-weight: 700;
      color: #92400e;
    }

    .progress-track {
      width: 100%;
      height: 10px;
      background: #f1f5f9;
      border-radius: 999px;
      margin-bottom: 24px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #f59e0b;
      border-radius: 999px;
      width: 10%;
      transition: width 0.3s ease;
    }

    .question-card {
      background: #fefce8;
      border: 2px dashed #fde047;
      border-radius: 16px;
      padding: 32px 16px;
      text-align: center;
      margin-bottom: 24px;
    }

    .math-formula {
      font-size: 2.8rem;
      font-weight: 800;
      color: #713f12;
      letter-spacing: 2px;
      font-variant-numeric: tabular-nums;
    }

    .answer-row {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .answer-input {
      flex: 1;
      padding: 14px 18px;
      font-size: 1.8rem;
      font-weight: 800;
      text-align: center;
      border: 3px solid #cbd5e1;
      border-radius: 14px;
      outline: none;
    }

    .answer-input:focus {
      border-color: #f59e0b;
    }

    .feedback-banner {
      display: none;
      padding: 14px;
      border-radius: 12px;
      text-align: center;
      font-weight: 800;
      font-size: 1.15rem;
      margin-bottom: 20px;
      animation: popIn 0.2s ease-out;
    }

    @keyframes popIn {
      0% { transform: scale(0.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .feedback-banner.correct {
      display: block;
      background: #dcfce7;
      color: #166534;
      border: 2px solid #86efac;
    }

    .feedback-banner.wrong {
      display: block;
      background: #fee2e2;
      color: #991b1b;
      border: 2px solid #fca5a5;
    }

    /* 結算畫面 */
    .result-score {
      font-size: 4rem;
      font-weight: 900;
      color: #d97706;
      text-align: center;
      margin: 16px 0;
    }

    .config-box {
      margin-top: 20px;
      padding: 14px;
      background: #f8fafc;
      border-radius: 10px;
      font-size: 0.85rem;
      color: var(--muted);
      border: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>

<div class="app-container">
  <!-- 頂部資訊列 -->
  <div class="header-bar">
    <div class="brand-title">
      <span>✏️ 小學數學大冒險</span>
    </div>
    <div id="gasStatus" style="font-size: 0.8rem; font-weight: 600;">☁️ Google Sheet 連動</div>
  </div>

  <!-- 第一階段/第二階段：登入畫面 -->
  <div id="screenLogin" class="screen active">
    <div class="hero-badge">
      <div class="hero-emoji">🎒</div>
      <h1 class="hero-title">歡迎登入數學練習！</h1>
      <p class="hero-subtitle">答題紀錄將自動同步至老師的 Google Sheet</p>
    </div>

    <div class="form-group">
      <label class="form-label" for="studentId">學生學號 (Student ID)</label>
      <input type="text" id="studentId" class="form-input" placeholder="例如：S101 或 202601" value="S101">
    </div>

    <div class="form-group">
      <label class="form-label" for="studentName">學生姓名 (Name)</label>
      <input type="text" id="studentName" class="form-input" placeholder="例如：小明、Amy" value="王小明">
    </div>

    <button id="btnStart" class="btn" onclick="handleLoginAndStart()">
      <span>🚀 開始練習</span>
    </button>

    <div class="config-box">
      <strong>⚙️ Google Apps Script API 網址：</strong>
      <div style="margin-top: 4px; word-break: break-all; color: #475569;" id="currentApiDisplay">
        ${defaultGasUrlPlaceholder}
      </div>
      <button style="margin-top: 8px; font-size: 0.75rem; padding: 4px 8px; cursor: pointer; border-radius: 4px; border: 1px solid #cbd5e1; background: white;" onclick="promptChangeGasUrl()">修改 API 網址</button>
    </div>
  </div>

  <!-- 載入過場畫面 -->
  <div id="screenLoading" class="screen">
    <div class="loading-box">
      <div class="spinner"></div>
      <h2 style="color: #92400e; font-size: 1.3rem;">載入題目中...</h2>
      <p style="color: #64748b; font-size: 0.9rem; margin-top: 6px;">正在登入並同步紀錄到 Google Sheet...</p>
    </div>
  </div>

  <!-- 第三階段：核心數學練習區 -->
  <div id="screenPractice" class="screen">
    <div class="practice-header">
      <span class="student-tag" id="dispStudentName">王小明 同學</span>
      <span style="font-weight: 800; color: #d97706;" id="dispQuestionIndex">第 1 / 10 題</span>
    </div>

    <div class="progress-track">
      <div id="progressBar" class="progress-fill"></div>
    </div>

    <div class="question-card">
      <div class="math-formula" id="dispFormula">35 + 28 = ?</div>
    </div>

    <div id="feedbackBanner" class="feedback-banner"></div>

    <div class="answer-row">
      <input type="number" id="answerInput" class="answer-input" placeholder="輸入答案" autocomplete="off" autofocus>
      <button id="btnSubmitAnswer" class="btn" style="width: 140px;" onclick="handleSubmitAnswer()">
        <span>送出</span>
      </button>
    </div>

    <button id="btnNext" class="btn" style="display: none; background: #059669;" onclick="handleNextQuestion()">
      <span>下一題 ➡️</span>
    </button>
  </div>

  <!-- 成績結算畫面 -->
  <div id="screenResult" class="screen">
    <div style="text-align: center; padding: 10px 0;">
      <div style="font-size: 56px;" id="resultEmoji">🏆</div>
      <h2 style="color: #92400e; font-size: 1.5rem; font-weight: 800;">練習完成！</h2>
      <p style="color: #64748b; margin-top: 4px;">總共完成 10 題數學練習</p>

      <div class="result-score">
        <span id="finalScoreText">100</span>
        <span style="font-size: 1.5rem; color: #b45309;">分</span>
      </div>

      <div id="syncStatusNotice" style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px; border-radius: 12px; color: #065f46; font-size: 0.9rem; margin-bottom: 20px;">
        ✅ 成績已同步回傳 Google Sheet！
      </div>

      <button class="btn" onclick="restartQuiz()">
        <span>🔄 再練習一次</span>
      </button>
    </div>
  </div>
</div>

<script>
  // ==========================================
  // 1. Google Apps Script Web App API 網址設定
  // ==========================================
  var YOUR_GAS_API_URL = "${defaultGasUrlPlaceholder}";

  function promptChangeGasUrl() {
    var newUrl = prompt("請輸入您的 Google Apps Script Web App 網址：", YOUR_GAS_API_URL);
    if (newUrl && newUrl.trim()) {
      YOUR_GAS_API_URL = newUrl.trim();
      document.getElementById("currentApiDisplay").innerText = YOUR_GAS_API_URL;
      localStorage.setItem("my_gas_url", YOUR_GAS_API_URL);
      alert("API 網址已儲存！");
    }
  }

  // 自動讀取上次儲存的 URL
  if (localStorage.getItem("my_gas_url")) {
    YOUR_GAS_API_URL = localStorage.getItem("my_gas_url");
    var disp = document.getElementById("currentApiDisplay");
    if (disp) disp.innerText = YOUR_GAS_API_URL;
  }

  // ==========================================
  // 2. 狀態管理與變數
  // ==========================================
  var currentStudent = { id: "", name: "" };
  var questions = [];
  var currentIndex = 0;
  var correctCount = 0;
  var isAnswerSubmitted = false;

  // 畫面切換函式
  function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(function(el) {
      el.classList.remove("active");
    });
    var target = document.getElementById(screenId);
    if (target) target.classList.add("active");
  }

  // ==========================================
  // 3. Google Apps Script POST 傳送函式
  // ==========================================
  function postToGoogleSheet(actionName, scoreValue) {
    var payload = {
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      action: actionName,
      timestamp: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }),
      score: (scoreValue !== undefined && scoreValue !== null) ? scoreValue : ""
    };

    console.log("送出資料至 GAS:", payload);

    // 使用 text/plain 避免 CORS preflight 預檢封鎖
    return fetch(YOUR_GAS_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).catch(function(err) {
      console.warn("GAS 請求送出 (以 no-cors 模式完成):", err);
    });
  }

  // ==========================================
  // 4. 第二階段：登入並啟動練習
  // ==========================================
  function handleLoginAndStart() {
    var sId = document.getElementById("studentId").value.trim();
    var sName = document.getElementById("studentName").value.trim();

    if (!sId || !sName) {
      alert("請填寫學生學號與姓名喔！");
      return;
    }

    currentStudent.id = sId;
    currentStudent.name = sName;

    // 顯示載入過場
    showScreen("screenLoading");

    // 發送登入紀錄到 Google Sheet
    postToGoogleSheet("登入", "");

    // 延遲 1 秒後生成題目並進入練習區
    setTimeout(function() {
      startQuizSession();
    }, 1000);
  }

  // ==========================================
  // 5. 第三階段：數學題目生成邏輯 (兩位數加減法)
  // ==========================================
  function generateTenQuestions() {
    var list = [];
    for (var i = 1; i <= 10; i++) {
      var isPlus = Math.random() > 0.45;
      var n1, n2, ans, op;

      if (isPlus) {
        op = "+";
        n1 = Math.floor(Math.random() * 60) + 15; // 15 - 74
        n2 = Math.floor(Math.random() * (99 - n1)) + 10;
        ans = n1 + n2;
      } else {
        op = "-";
        n1 = Math.floor(Math.random() * 70) + 25; // 25 - 94
        n2 = Math.floor(Math.random() * (n1 - 10)) + 11;
        ans = n1 - n2;
      }

      list.push({
        id: i,
        n1: n1,
        n2: n2,
        op: op,
        correctAnswer: ans,
        formula: n1 + " " + op + " " + n2 + " = ?"
      });
    }
    return list;
  }

  function startQuizSession() {
    questions = generateTenQuestions();
    currentIndex = 0;
    correctCount = 0;
    document.getElementById("dispStudentName").innerText = currentStudent.name + " 同學";
    renderCurrentQuestion();
    showScreen("screenPractice");
  }

  function renderCurrentQuestion() {
    isAnswerSubmitted = false;
    var q = questions[currentIndex];

    document.getElementById("dispQuestionIndex").innerText = "第 " + (currentIndex + 1) + " / 10 題";
    document.getElementById("progressBar").style.width = ((currentIndex + 1) * 10) + "%";
    document.getElementById("dispFormula").innerText = q.formula;

    var input = document.getElementById("answerInput");
    input.value = "";
    input.disabled = false;
    input.focus();

    var feedback = document.getElementById("feedbackBanner");
    feedback.className = "feedback-banner";
    feedback.style.display = "none";

    document.getElementById("btnSubmitAnswer").style.display = "inline-block";
    document.getElementById("btnNext").style.display = "none";
  }

  // 學生送出答案
  function handleSubmitAnswer() {
    if (isAnswerSubmitted) return;

    var input = document.getElementById("answerInput");
    var val = input.value.trim();
    if (val === "") {
      alert("請先輸入答案再送出喔！");
      return;
    }

    var userAns = parseInt(val, 10);
    var q = questions[currentIndex];
    var isCorrect = (userAns === q.correctAnswer);

    isAnswerSubmitted = true;
    input.disabled = true;

    var feedback = document.getElementById("feedbackBanner");
    feedback.style.display = "block";

    if (isCorrect) {
      correctCount++;
      feedback.className = "feedback-banner correct";
      feedback.innerText = "🎉 太棒了，答對了！";
    } else {
      feedback.className = "feedback-banner wrong";
      feedback.innerText = "💡 哎呀差一點！正確答案是 " + q.correctAnswer;
    }

    document.getElementById("btnSubmitAnswer").style.display = "none";
    document.getElementById("btnNext").style.display = "block";
  }

  // 進入下一題或結算
  function handleNextQuestion() {
    currentIndex++;
    if (currentIndex < 10) {
      renderCurrentQuestion();
    } else {
      finishQuiz();
    }
  }

  // 支援 Enter 鍵送出或下一題
  document.getElementById("answerInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      if (!isAnswerSubmitted) {
        handleSubmitAnswer();
      } else {
        handleNextQuestion();
      }
    }
  });

  // 結算成績與同步回傳
  function finishQuiz() {
    var finalScore = correctCount * 10;
    document.getElementById("finalScoreText").innerText = finalScore;

    var emoji = "🏆";
    if (finalScore >= 90) emoji = "🌟 滿分小天才！";
    else if (finalScore >= 70) emoji = "👏 非常棒，繼續保持！";
    else emoji = "💪 再接再厲，多練習就會更厲害！";
    document.getElementById("resultEmoji").innerText = emoji;

    showScreen("screenResult");

    // 第三階段需求：結算後呼叫 Google Apps Script API 紀錄學號、姓名、完成練習與分數
    postToGoogleSheet("完成練習", finalScore);
  }

  function restartQuiz() {
    startQuizSession();
  }
</script>

</body>
</html>`;
}
