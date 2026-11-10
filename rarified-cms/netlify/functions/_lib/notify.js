// Optional email alert via Resend. Fails soft: a missing key never blocks an enquiry.
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export async function sendNotice(r) {
  const { RESEND_API_KEY: k, FROM_EMAIL: from, NOTIFY_EMAIL: to } = process.env;
  if (!k || !from || !to) return;
  try {
    await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject: `New enquiry — ${r.name}`, html: `<p><b>${esc(r.name)}</b> (${esc(r.email)}, ${esc(r.phone)})<br>${esc(r.interest)}</p><p>${esc(r.message)}</p>` }) });
  } catch (e) { console.error('notify failed', e); }
}
