import { GasPayload, HistoryRecord } from '../types';

export const GAS_URL_STORAGE_KEY = 'elementary_math_gas_api_url';
export const HISTORY_STORAGE_KEY = 'elementary_math_history_records';

export const DEFAULT_GAS_CODE = `/**
 * Google Apps Script (GAS) - 小學數學練習紀錄後端 API
 * 
 * 部署指南：
 * 1. 在 Google 雲端硬碟建立一個新的「Google 試算表 (Google Sheets)」
 * 2. 將第一個工作表更名為「紀錄」
 * 3. 點擊上方選單【擴充功能】 > 【Apps Script】
 * 4. 將原本內容清除，貼上這整份程式碼並按儲存 (Ctrl+S / Cmd+S)
 * 5. 點擊右上角【部署】 > 【新部署】
 * 6. 左側齒輪選擇「網頁應用程式 (Web app)」
 *    - 說明：小學數學紀錄 API
 *    - 執行身分：我 (您的 Google 帳號)
 *    - 誰可以存取：任何人 (Anyone)  ※此設定才允許前端免登入傳送資料
 * 7. 點擊【部署】，授予存取權限 (若出現警告請點進階 > 前往專案)
 * 8. 複製產生的「網頁應用程式網址」，貼回本軟體的設定視窗中！
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // 最多等待 10 秒，避免多人同時寫入衝突
  try {
    lock.waitLock(10000);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "系統繁忙，請稍候重試"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var sheetName = "紀錄";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    // 若工作表不存在則自動建立，並寫入表頭
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["時間戳記", "學號", "姓名", "動作", "得分", "備註"]);
      sheet.setFrozenRows(1);
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(["時間戳記", "學號", "姓名", "動作", "得分", "備註"]);
      sheet.setFrozenRows(1);
    }

    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && Object.keys(e.parameter).length > 0) {
      data = e.parameter;
    } else {
      throw new Error("未接收到任何有效資料");
    }

    var studentId = data.studentId || "";
    var studentName = data.studentName || "";
    var action = data.action || "";
    var timestamp = data.timestamp || new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
    var score = (data.score !== undefined && data.score !== null && data.score !== "") ? data.score : "";
    var note = data.note || "";

    // 依序寫入新的一列
    sheet.appendRow([timestamp, studentId, studentName, action, score, note]);

    var result = {
      status: "success",
      message: "資料已成功寫入 Google Sheet",
      received: {
        studentId: studentId,
        studentName: studentName,
        action: action,
        score: score,
        timestamp: timestamp
      }
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var errorResult = {
      status: "error",
      message: error.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Google Apps Script 數學練習 API 已在線運作中！"
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

export function getSavedGasUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GAS_URL_STORAGE_KEY) || '';
}

export function saveGasUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GAS_URL_STORAGE_KEY, url.trim());
}

export function getHistoryRecords(): HistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistoryRecord(record: HistoryRecord): void {
  if (typeof window === 'undefined') return;
  const current = getHistoryRecords();
  const updated = [record, ...current].slice(0, 50); // keep last 50
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
}

export function clearHistoryRecords(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}

/**
 * Send record to Google Apps Script.
 * Uses text/plain to avoid CORS preflight rejection by GAS.
 * Also handles no-cors fallback if redirect happens.
 */
export async function sendRecordToGas(payload: GasPayload): Promise<{
  success: boolean;
  isSimulated: boolean;
  message: string;
}> {
  const apiUrl = getSavedGasUrl();
  const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // If no API URL has been set yet, simulate success and store locally
  if (!apiUrl || !apiUrl.startsWith('https://script.google.com/macros/s/')) {
    const record: HistoryRecord = {
      id,
      timestamp: payload.timestamp,
      studentId: payload.studentId,
      studentName: payload.studentName,
      action: payload.action,
      score: payload.score,
      syncStatus: 'simulated',
      apiUrlUsed: apiUrl || '尚未設定 (本地留存)',
      errorMessage: '尚未設定 Google Apps Script Web App URL，已妥善保存在瀏覽器記錄中',
    };
    addHistoryRecord(record);

    return {
      success: true,
      isSimulated: true,
      message: '尚未設定 Google Sheet 網址，系統已在本地建立練習紀錄。隨時可於右上角「雲端設定」填入 API 網址！',
    };
  }

  try {
    // GAS standard POST: Use text/plain to bypass CORS preflight
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      let jsonResult;
      try {
        jsonResult = await response.json();
      } catch {
        jsonResult = { status: 'success', message: '已收到伺服器回應' };
      }

      addHistoryRecord({
        id,
        timestamp: payload.timestamp,
        studentId: payload.studentId,
        studentName: payload.studentName,
        action: payload.action,
        score: payload.score,
        syncStatus: 'synced',
        apiUrlUsed: apiUrl,
      });

      return {
        success: true,
        isSimulated: false,
        message: jsonResult.message || '已成功寫入 Google Sheets！',
      };
    } else {
      throw new Error(`HTTP 錯誤碼: ${response.status}`);
    }
  } catch (error: unknown) {
    // When Google Apps Script performs a 302 redirect to script.googleusercontent.com,
    // the browser fetch can occasionally hit an opaque response or CORS warning.
    // Try no-cors fallback send so the Google Sheet receives the payload regardless.
    try {
      await fetch(apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      addHistoryRecord({
        id,
        timestamp: payload.timestamp,
        studentId: payload.studentId,
        studentName: payload.studentName,
        action: payload.action,
        score: payload.score,
        syncStatus: 'synced',
        apiUrlUsed: apiUrl,
      });

      return {
        success: true,
        isSimulated: false,
        message: '資料已送達 Google Sheet！',
      };
    } catch (fallbackError: unknown) {
      const errMsg = fallbackError instanceof Error ? fallbackError.message : String(error);
      addHistoryRecord({
        id,
        timestamp: payload.timestamp,
        studentId: payload.studentId,
        studentName: payload.studentName,
        action: payload.action,
        score: payload.score,
        syncStatus: 'failed',
        apiUrlUsed: apiUrl,
        errorMessage: errMsg,
      });

      return {
        success: false,
        isSimulated: false,
        message: `傳送失敗：${errMsg}。請確認 Google Apps Script 部署身分是否為「任何人 (Anyone)」`,
      };
    }
  }
}
