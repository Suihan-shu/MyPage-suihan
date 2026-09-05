const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function fixture({ height = 1600, viewport = 600, native = true, present = true } = {}) {
  const queue = [];
  const listeners = {};
  const progress = { style: {}, value: 0 };
  const body = { style: {} };
  const html = { scrollHeight: height };
  let observer;
  let measurements = 0;
  const nav = { getBoundingClientRect() { measurements++; return { height: 56 }; } };
  const on = (key, handler) => (listeners[key] ||= []).push(handler);
  const existingOnload = () => {};
  const window = { innerHeight: viewport, scrollY: 0, onload: existingOnload,
    addEventListener: on, requestAnimationFrame: fn => queue.push(fn) };
  const document = { body, documentElement: html, addEventListener: on,
    getElementById: id => id === 'progress' ? (present ? progress : null) : nav,
    createElement: () => native ? { max: 1 } : {} };
  vm.runInNewContext(fs.readFileSync('assets/js/progress-bar.js', 'utf8'), {
    window, document, getComputedStyle: () => ({ position: 'fixed', marginTop: '0', marginBottom: '0' }),
    ResizeObserver: class { constructor(cb) { observer = cb; } observe() {} }
  });
  return { progress, window, html, queue, existingOnload,
    flush() { const frame = queue.splice(0); frame.forEach(fn => fn()); },
    emit(type) { (listeners[type] || []).forEach(fn => fn()); },
    resize() { observer(); }, measureCount: () => measurements };
}
test('scroll bursts cause one frame update without repeated layout measurements', () => {
  const f = fixture(); f.flush();
  const measured = f.measureCount();
  for (let i = 0; i < 100; i++) { f.window.scrollY = i; f.emit('scroll'); }
  assert.equal(f.queue.length, 1); f.flush();
  assert.equal(f.progress.value, 99);
  assert.equal(f.measureCount(), measured);
  assert.equal(f.window.onload, f.existingOnload);
});
test('lazy content growth refreshes the scroll range', () => {
  const f = fixture(); f.flush();
  assert.equal(f.progress.max, 1000);
  f.html.scrollHeight = 2600; f.resize(); f.flush();
  assert.equal(f.progress.max, 2000);
  f.window.scrollY = 2000; f.emit('scroll'); f.flush();
  assert.equal(f.progress.value, 2000);
});
test('short pages and overscroll produce a valid finite progress value', () => {
  for (const native of [true, false]) {
    const f = fixture({ height: 400, native }); f.flush();
    f.window.scrollY = -40; f.emit('scroll'); f.flush();
    if (native) { assert.equal(f.progress.max, 1); assert.equal(f.progress.value, 0); }
    else assert.equal(f.progress.style.width, '0%');
  }
});
test('pages without a progress bar schedule no work', () => {
  const f = fixture({ present: false }); assert.equal(f.queue.length, 0);
});
