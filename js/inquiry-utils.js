/** Pure, browser-compatible guest-inquiry helpers. No network or storage access. */
(() => {
  'use strict';

  const isISODate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
    const [year, month, day] = value.split('-').map(Number);
    if (year < 1900 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return false;
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
  };

  const addDays = (value, count = 1) => {
    if (!isISODate(value)) return '';
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + count));
    return date.toISOString().slice(0, 10);
  };

  const isValidStay = (checkin, checkout, currentDate) =>
    isISODate(checkin) && isISODate(checkout) && isISODate(currentDate) &&
    checkin >= currentDate && checkout > checkin;

  const eligibleRoomKeys = (rooms, guests) => {
    const count = Number(guests);
    if (!Number.isSafeInteger(count) || count < 1) return [];
    return Object.keys(rooms).filter(key => Number(rooms[key]?.guests) >= count);
  };

  const escapeCell = (value) => {
    const raw = String(value ?? '');
    // Prevent formula execution when opened in common spreadsheet applications.
    const safe = /^\s*[=+\-@]/u.test(raw) ? `'${raw}` : raw;
    return `"${safe.replace(/"/g, '""')}"`;
  };

  const exportCsv = (rows, columns) =>
    [columns.map(escapeCell).join(','), ...rows.map(row => columns.map(key => escapeCell(row[key])).join(','))].join('\r\n');

  window.AJV_UTILS = {isISODate, addDays, isValidStay, eligibleRoomKeys, exportCsv};
})();
