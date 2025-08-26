// backend/services/sheetsService.js
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const keyFileEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
// Nếu .env có GOOGLE_APPLICATION_CREDENTIALS thì ưu tiên dùng, hỗ trợ cả path tương đối & tuyệt đối.
// Nếu không có, fallback về file đặt cạnh services: services/google-service-account.json
const keyFile = keyFileEnv
  ? (path.isAbsolute(keyFileEnv) ? keyFileEnv : path.join(process.cwd(), keyFileEnv))
  : path.join(__dirname, 'google-service-account.json');

if (!fs.existsSync(keyFile)) {
  // Lỗi rõ ràng để biết sai đường dẫn JSON
  throw new Error(
    `[Sheets] Không tìm thấy file service account: ${keyFile}. ` +
    `Hãy kiểm tra biến GOOGLE_APPLICATION_CREDENTIALS trong .env hoặc đặt file JSON đúng vị trí.`
  );
}

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const asText = (v) =>
(typeof v === 'object' && v
  ? [v.color ? `Màu: ${v.color}` : null, v.size ? `Size: ${v.size}` : null]
    .filter(Boolean).join('; ')
  : (v || ''));

exports.appendOrder = async (order) => {

  const spreadsheetId = (process.env.GS_SHEET_ID || '').trim();
  console.log('[Sheets] Using sheet:', JSON.stringify(spreadsheetId), 'length=', spreadsheetId.length);

  if (!spreadsheetId) throw new Error('Missing GS_SHEET_ID');

  console.log('[Sheets] Using sheet:', spreadsheetId);
  console.log('[Sheets] Using keyFile:', keyFile);

  const values = [[
    order.id,
    new Date().toLocaleString('vi-VN'),
    order.productId || '',
    order.productName || '',
    asText(order.variant),
    Number(order.quantity || 1),
    Number(order.price || 0),
    Number(order.total || 0),
    order.fullName || '',
    order.phone || '',
    order.address || '',
    order.note || '',
  ]];

  try {
    // Kiểm tra tab Orders tồn tại
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Orders!A1',
    });

    // Append 1 dòng
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Orders!A:Z',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });
    console.log('Successfully appended order to sheet:', order.id);
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  } catch (err) {
    const e = err?.response?.data || err;
    console.error('[Sheets] Append ERR:', e);

    // Google API hay trả err.code là số; đề phòng cả err.status
    const code = err?.code || err?.status;

    if (code === 404) {
      throw new Error('Google Sheet không tồn tại hoặc tab "Orders" chưa có. Kiểm tra GS_SHEET_ID và tên tab.');
    }
    if (code === 403) {
      throw new Error('Service account chưa có quyền Editor với Google Sheet. Hãy Share cho email trong file JSON.');
    }

    // Các lỗi khác (mạng, quota, JSON sai nội dung, ...)
    // console.log(err);
    throw new Error('Lỗi khi lưu đơn hàng vào Google Sheet: ' + (err.message || 'Unknown'));
  }
};
