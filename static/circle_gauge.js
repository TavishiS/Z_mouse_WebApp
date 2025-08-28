/* Canvas gauge that fills while the user presses & holds. */
export function buildGauge(container, label, baseRGB) {
  const SIZE = 140;
  const cvs  = Object.assign(document.createElement('canvas'),
                             { width: SIZE, height: SIZE });
  const ctx  = cvs.getContext('2d');
  container.appendChild(cvs);

  const cap = document.createElement('div');
  cap.textContent = label;
  cap.style.textAlign = 'center';
  cap.style.marginTop = '6px';
  container.appendChild(cap);

  let rafId, startT;

  function draw(deg) {
    ctx.clearRect(0, 0, SIZE, SIZE);

    ctx.lineWidth = 16;
    ctx.strokeStyle = `rgba(${baseRGB},0.25)`;
    ctx.beginPath();
    ctx.arc(SIZE/2, SIZE/2, SIZE/2 - 10, 0, 2 * Math.PI);
    ctx.stroke();

    if (deg > 0) {
      ctx.strokeStyle = `rgb(${baseRGB})`;
      ctx.beginPath();
      ctx.arc(SIZE/2, SIZE/2, SIZE/2 - 10, -Math.PI/2,
              -Math.PI/2 + deg * Math.PI / 180);
      ctx.stroke();
    }

    ctx.fillStyle = '#333';
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(deg / 3.6)}%`, SIZE/2, SIZE/2);
  }

  function animate(ts) {
    if (!startT) startT = ts;
    const pct = Math.min((ts - startT) / 2000, 1);   // full in 2 s
    draw(pct * 360);
    if (pct < 1) rafId = requestAnimationFrame(animate);
  }

  cvs.addEventListener('mousedown', () => {
    cancelAnimationFrame(rafId);
    startT = null;
    rafId  = requestAnimationFrame(animate);
  });
  ['mouseup', 'mouseleave'].forEach(ev =>
    cvs.addEventListener(ev, () => cancelAnimationFrame(rafId)));

  draw(0);
}
