// Helper to convert an RGB color string to an HSL array
function rgbToHsl(rgbString) {
  const [r, g, b] = rgbString.split(',').map(Number);
  const r_norm = r / 255;
  const g_norm = g / 255;
  const b_norm = b / 255;

  const max = Math.max(r_norm, g_norm, b_norm);
  const min = Math.min(r_norm, g_norm, b_norm);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r_norm: h = (g_norm - b_norm) / d + (g_norm < b_norm ? 6 : 0); break;
      case g_norm: h = (b_norm - r_norm) / d + 2; break;
      case b_norm: h = (r_norm - g_norm) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

export function buildGauge(container, label, baseRGB) {
  const SIZE = 140;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  container.appendChild(canvas);

  const caption = document.createElement('div');
  caption.textContent = label;
  caption.style.textAlign = 'center';
  caption.style.marginTop = '6px';
  container.appendChild(caption);

  let surity = 100;
  let intervalId = null;
  const [hue, initialSaturation] = rgbToHsl(baseRGB);
  const saturation = Math.max(initialSaturation, 30); // Ensure a minimum saturation

  function draw() {
    const angle = surity * 3.6;
    const lightness = 100 - (surity / 100) * 40; // Adjusts from 100% down to 60%

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.lineWidth = 16;

    // Background ring
    ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${Math.min(100, lightness + 10)}%)`;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 10, 0, 2 * Math.PI);
    ctx.stroke();

    // Foreground (surity) ring
    if (angle > 0) {
      ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness - 30}%)`;
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 10, -Math.PI / 2, -Math.PI / 2 + angle * Math.PI / 180);
      ctx.stroke();
    }

    // Text inside the gauge
    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${Math.max(20, lightness - 40)}%)`;
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${surity}%`, SIZE / 2, SIZE / 2);
  }

  function startAdjust(direction) {
    if (intervalId) return; // Prevent multiple intervals
    intervalId = setInterval(() => {
      surity = Math.max(0, Math.min(100, surity + direction));
      draw();
    }, 50);
  }

  function stopAdjust() {
    clearInterval(intervalId);
    intervalId = null;
  }

  canvas.addEventListener('mousedown', e => {
    e.preventDefault();
    if (e.button === 0) startAdjust(-1); // Left-click: decrease
    if (e.button === 2) startAdjust(1);  // Right-click: increase
  });
  
  canvas.addEventListener('mouseup', stopAdjust);
  canvas.addEventListener('mouseleave', stopAdjust);
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  draw(); // Initial draw

  return {
    getSurity: () => surity
  };
}