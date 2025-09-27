/*
Canvas gauge that can be adjusted with left/right clicks.
The color lightness/darkness is based on the surity percentage.
*/

// Helper to convert RGB color string to HSL
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
  const cvs = Object.assign(document.createElement('canvas'), {
    width: SIZE,
    height: SIZE
  });
  const ctx = cvs.getContext('2d');
  container.appendChild(cvs);

  const cap = document.createElement('div');
  cap.textContent = label;
  cap.style.textAlign = 'center';
  cap.style.marginTop = '6px';
  container.appendChild(cap);

  let surity = 100;
  const [hue, initialSaturation] = rgbToHsl(baseRGB);

  // Ensure a minimum saturation to avoid pure grey, unless it's a truly achromatic color
  const saturation = Math.max(initialSaturation, 30); // Minimum 30% saturation

  function draw() {
    const deg = surity * 3.6;
    // Adjust lightness range: 50 (surity 100) to 90 (surity 0)
    const currentLightness = 90 - (surity / 100) * 40;

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.lineWidth = 16;

    // Background ring (unfilled part) - slightly lighter than the currentLightness
    const backgroundLightness = Math.min(95, currentLightness + 10); // Max 95% lightness
    ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${backgroundLightness}%)`;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 10, 0, 2 * Math.PI);
    ctx.stroke();

    // Foreground (surity) ring (filled part)
    if (deg > 0) {
      ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${currentLightness}%)`;
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 10, -Math.PI / 2, -Math.PI / 2 + deg * Math.PI / 180);
      ctx.stroke();
    }

    // Text color - ensure it's always readable and not too dark
    const textColorLightness = Math.max(20, currentLightness - 40); // Min 20% lightness
    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${textColorLightness}%)`;
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${surity}%`, SIZE / 2, SIZE / 2);
  }


  //..........mouse hold instead of click......... */
  let intervalId = null;   // will hold our repeating timer

function startAdjust(direction) {
  // direction: -1 for decrease, +1 for increase
  if (intervalId) return;  // already running
  intervalId = setInterval(() => {
    if (direction === -1) {
      surity = Math.max(0, surity - 1); // decrease slowly
    } else {
      surity = Math.min(100, surity + 1); // increase slowly
    }
    draw();
  }, 50); // adjust speed (50 ms = 20 steps/sec)
}

function stopAdjust() {
  clearInterval(intervalId);
  intervalId = null;
}

// Left mouse hold → decrease
cvs.addEventListener('mousedown', e => {
  if (e.button === 0) {          // 0 = left button
    e.preventDefault();
    startAdjust(-1);
  }
});

// Right mouse hold → increase
cvs.addEventListener('mousedown', e => {
  if (e.button === 2) {          // 2 = right button
    e.preventDefault();
    startAdjust(1);
  }
});

// Stop on mouseup or when pointer leaves canvas
cvs.addEventListener('mouseup', stopAdjust);
cvs.addEventListener('mouseleave', stopAdjust);

// Prevent context menu on right-click
cvs.addEventListener('contextmenu', e => e.preventDefault());

draw();

return {
  getSurity: () => surity
};

}