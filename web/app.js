import {receiptDemo, inspect} from '../src/receipt.mjs';
import {timeoutDemo} from '../src/timeout.mjs';
import {makeQuote, paymentRequired} from '../src/quote.mjs';

const out = document.getElementById('demo');
const btn = document.getElementById('run');

const fmt = (n) => `${n.toString()} sompi`;

btn.addEventListener('click', () => {
  const demo = receiptDemo();
  const snap = inspect(demo.state);
  const lines = demo.steps.map((s, i) => {
    const flag = s.backedOneToOne ? '1:1' : 'BROKEN';
    return `${i + 1}. ${s.title}\n   ${s.lesson}\n   locked ${fmt(s.lockedSompi)} · claims ${fmt(s.circulating)} · ${flag}`;
  });
  lines.push('');
  lines.push(`skim try → ${demo.skim}`);
  lines.push(`series empty → ${snap.lockedSompi === 0n && snap.circulating === 0n}`);
  lines.push(`oracle → ${snap.oracle}`);
  lines.push(snap.warning);
  lines.push('');
  lines.push('ENGINE_SPEC. Not SCRIPT_ENFORCED. Parker’s TN10 pack is in artifacts/, not this click.');
  out.textContent = lines.join('\n');
});

const showTimeout = (path) => {
  const demo = timeoutDemo({path});
  const lines = demo.steps.map((s, i) => `${i + 1}. ${s.title}\n   ${s.lesson}${s.code ? ` (${s.code})` : ''}`);
  lines.push('');
  lines.push(`path → ${path}`);
  lines.push(`too-early → ${demo.tooEarly}`);
  lines.push(`skim (ENGINE_SPEC stub) → ${demo.skim}`);
  lines.push(`status → ${demo.lock.status}`);
  lines.push(demo.inspect.warning);
  document.getElementById('timeout-out').textContent = lines.join('\n');
};

document.getElementById('run-timeout').addEventListener('click', () => showTimeout('reclaim'));
document.getElementById('run-timeout-claim').addEventListener('click', () => showTimeout('claim'));

document.getElementById('run-402').addEventListener('click', () => {
  const now = 1_800_000_000_000n;
  const quote = makeQuote({
    sender: 'aa'.repeat(32),
    recipient: 'bb'.repeat(32),
    sompi: 20_000_000n,
    timeout: now + 48n * 3600n * 1000n,
    now,
    nonce: 'cc'.repeat(32),
    postage: 'sponsor',
    asset: 'kas-native',
  });
  document.getElementById('quote-out').textContent = JSON.stringify(paymentRequired(quote), null, 2);
});
