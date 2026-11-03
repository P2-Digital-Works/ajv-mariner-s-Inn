const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/inquiry-utils.js'), 'utf8');
const sandbox = {window: {}};
vm.runInNewContext(source, sandbox);
const { isValidStay, addDays, eligibleRoomKeys, exportCsv } = sandbox.window.AJV_UTILS;

test('rejects invalid, past, same-day, impossible dates', () => {
  for (const [start, end] of [
    ['', '2026-11-10'], ['2026-11-02','2026-11-03'],
    ['2026-11-03','2026-11-03'], ['2026-11-04','2026-11-03'],
    ['2026-02-31','2026-03-02'], ['2026-11-05','not-a-date']
  ]) assert.equal(isValidStay(start, end, '2026-11-03'), false, `${start} / ${end}`);
  assert.equal(isValidStay('2026-11-03', '2026-11-04', '2026-11-03'), true);
});

test('date addition handles month, year, leap boundaries without UTC shifting', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(addDays('2028-02-29', 1), '2028-03-01');
});

test('room filtering is explicit and is not a live availability claim', () => {
  const rooms = { classic: {guests:2}, family:{guests:4}, twin:{guests:2} };
  assert.equal(JSON.stringify(eligibleRoomKeys(rooms, 3)), '["family"]');
  assert.equal(JSON.stringify(eligibleRoomKeys(rooms, 6)), '[]');
});

test('CSV export escapes quotations, newlines and spreadsheet formula injection', () => {
  const csv = exportCsv([{name:'=HYPERLINK("bad")',message:'\n+SUM(1,2)',email:'demo@example.com'}], ['name','message','email']);
  assert.match(csv,/"'=HYPERLINK\(""bad""\)"/);
  assert.match(csv,/"'\n\+SUM\(1,2\)"/);
  assert.match(csv, /"demo@example.com"/);
});
