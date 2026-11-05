/**
 * Тиша — зв'язка сайту з Google Таблицею бронювань.
 *
 * Що робить:
 *  - GET  ?action=availability  → віддає сайту зайняті дати по кожному будинку;
 *  - POST (JSON)                → записує нову заявку з сайту рядком у таблицю,
 *                                 попередньо перевіряючи, що дати ще вільні.
 *
 * Адміністратор працює лише з таблицею: вносить бронювання з Instagram чи телефону,
 * змінює статус або скасовує. Сайт бачить зміни одразу.
 *
 * Інструкція з налаштування: SETUP.md поруч із цим файлом.
 */

const SHEET_NAME = 'Бронювання';
const HOUSES = ['Смерека', 'Полонина', 'Ватра'];
const SOURCES = ['Instagram', 'Телефон', 'Сайт', 'Booking', 'Інше'];
const STATUSES = ['Нова заявка', 'Підтверджено', 'Передоплата', 'Скасовано'];
/** Рядки з цим статусом не блокують дати. */
const FREE_STATUS = 'Скасовано';

const HEADERS = ['Будинок', 'Заїзд', 'Виїзд', 'Гостей', "Ім'я", 'Телефон', 'Джерело', 'Статус', 'Коментар', 'Створено', 'ID'];
const COL = { house: 0, from: 1, to: 2, guests: 3, name: 4, phone: 5, source: 6, status: 7, comment: 8, created: 9, id: 10 };

/* ------------------------------------------------------------------ */
/*  Запустіть один раз вручну: Виконати → setup                        */
/* ------------------------------------------------------------------ */
function setup() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setBackground('#13201b').setFontColor('#e4e7e1');
  sheet.setFrozenRows(1);

  const rows = sheet.getMaxRows() - 1;
  const list = (values) => SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  const date = SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build();

  sheet.getRange(2, COL.house + 1, rows).setDataValidation(list(HOUSES));
  sheet.getRange(2, COL.from + 1, rows, 2).setDataValidation(date).setNumberFormat('dd.mm.yyyy');
  sheet.getRange(2, COL.source + 1, rows).setDataValidation(list(SOURCES));
  sheet.getRange(2, COL.status + 1, rows).setDataValidation(list(STATUSES));
  sheet.getRange(2, COL.created + 1, rows).setNumberFormat('dd.mm.yyyy hh:mm');

  // Кольори статусів
  const statusRange = sheet.getRange(2, COL.status + 1, rows);
  const rule = (text, bg) => SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(text).setBackground(bg).setRanges([statusRange]).build();
  sheet.setConditionalFormatRules([
    rule('Нова заявка', '#f6dccf'),
    rule('Підтверджено', '#d7e6da'),
    rule('Передоплата', '#c9dccd'),
    rule('Скасовано', '#e6e6e6'),
  ]);

  sheet.setColumnWidths(1, HEADERS.length, 130);
  sheet.setColumnWidth(COL.comment + 1, 260);
}

/* ------------------------------------------------------------------ */
/*  Сайт запитує зайняті дати                                          */
/* ------------------------------------------------------------------ */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'availability';
  if (action !== 'availability') return json({ ok: false, error: 'unknown action' });
  return json({ ok: true, houses: readBooked() });
}

/* ------------------------------------------------------------------ */
/*  Сайт надсилає нову заявку                                          */
/* ------------------------------------------------------------------ */
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'invalid json' });
  }

  const token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (token && body.token !== token) return json({ ok: false, error: 'forbidden' });

  if (HOUSES.indexOf(body.house) === -1 || !isISO(body.from) || !isISO(body.to) || body.from >= body.to) {
    return json({ ok: false, error: 'invalid' });
  }

  // Блокування, щоб дві одночасні заявки не забронювали ті самі дати.
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const booked = readBooked()[body.house] || [];
    const taken = booked.some((r) => body.from < r.to && r.from < body.to);
    if (taken) return json({ ok: false, error: 'taken' });

    const id = 'T-' + Utilities.formatDate(new Date(), tz(), 'yyMMdd') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const row = [];
    row[COL.house] = body.house;
    row[COL.from] = toDate(body.from);
    row[COL.to] = toDate(body.to);
    row[COL.guests] = Number(body.guests) || '';
    row[COL.name] = String(body.name || '').slice(0, 120);
    row[COL.phone] = "'" + String(body.phone || '').slice(0, 40); // апостроф зберігає «+380» як текст
    row[COL.source] = 'Сайт';
    row[COL.status] = 'Нова заявка';
    row[COL.comment] = String(body.comment || '').slice(0, 1000);
    row[COL.created] = new Date();
    row[COL.id] = id;

    sheet().appendRow(row);
    SpreadsheetApp.flush();
    return json({ ok: true, id: id });
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------------------------------------------ */

function readBooked() {
  const values = sheet().getDataRange().getValues().slice(1);
  const out = {};
  HOUSES.forEach((h) => (out[h] = []));

  values.forEach((r) => {
    const house = String(r[COL.house]).trim();
    const status = String(r[COL.status]).trim();
    if (!out[house] || status === FREE_STATUS) return;
    const from = toISO(r[COL.from]);
    const to = toISO(r[COL.to]);
    if (from && to && from < to) out[house].push({ from: from, to: to });
  });
  return out;
}

function sheet() {
  const s = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!s) throw new Error('Немає аркуша «' + SHEET_NAME + '». Запустіть функцію setup.');
  return s;
}

function tz() {
  return SpreadsheetApp.getActive().getSpreadsheetTimeZone();
}

function toISO(v) {
  if (v instanceof Date && !isNaN(v)) return Utilities.formatDate(v, tz(), 'yyyy-MM-dd');
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return s;
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/); // 12.11.2026
  if (m) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  return null;
}

function toDate(iso) {
  const p = iso.split('-').map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
}

function isISO(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
