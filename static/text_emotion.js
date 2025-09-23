import { buildGauge } from './circle_gauge.js';

/* ---------- helpers ---------- */
function getRandomColor(alpha) {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r},${g},${b},${alpha})`;
}

const emotionColors = {
  joy: 'rgba(255,255,0,0.2)',
  surprise: 'rgba(255,165,0,0.2)',
  sadness: 'rgba(0,0,255,0.2)',
  neutral: 'rgba(128,128,128,0.2)',
  anger: 'rgba(255,0,0,0.2)',
  disgust: 'rgba(0,128,0,0.2)',
  fear: 'rgba(128,0,128,0.2)',
  Others: 'rgba(0,0,0,0.2)'
};

/* ---------- main ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('text-input');
  const analyzeBtn = document.getElementById('analyze-btn');
  const resultsDiv = document.getElementById('results');
  const ctx1 = document.getElementById('emotion-chart-1').getContext('2d');
  const ctx2 = document.getElementById('emotion-chart-2').getContext('2d');
  const gaugeWrap = document.getElementById('top-emotions');
  const feedbackSection = document.getElementById('feedback-section');
  const showGaugesBtn = document.getElementById('show-gauges-btn');

  let chart1 = null;
  let chart2 = null;
  let analysisData = null;

  

  analyzeBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
      resultsDiv.textContent = 'Please enter some text to analyze.';
      return;
    }
    resultsDiv.textContent = 'Analyzing…';
    gaugeWrap.innerHTML = '';
    feedbackSection.style.display = 'none';

    try {
      const resp = await fetch('/text_to_emo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text
        })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }
      const data = await resp.json();

      let others = 0,
        filtered = {};
      for (const [lab, sc] of Object.entries(data)) {
        sc < 3 ? others += sc: filtered[lab] = sc;
      }
      if (others) filtered.Others = others;

      const sorted = Object.entries(filtered).sort((a, b) => b[1] - a[1]);
      analysisData = sorted;

      resultsDiv.textContent = 'Emotion Scores:\n\n' +
        sorted.map(([l, s]) => `${l}: ${s.toFixed(1)}%`).join('\n');

      const labels = sorted.map(([l]) => l);
      const values = sorted.map(([, s]) => s);

      const dataset = {
        data: values,
        backgroundColor: labels.map(l => emotionColors[l] || getRandomColor(0.2)),
        borderColor: '#555',
        borderWidth: 1.5
      };

      const chartOptions = {
          responsive: true,
          plugins: { legend: { position:'bottom' } }
      };

      if (chart1) {
        chart1.data.labels = labels;
        chart1.data.datasets[0] = dataset;
        chart1.update();
      } else {
        chart1 = new Chart(ctx1, { type: 'pie', data: { labels, datasets: [dataset] }, options: chartOptions });
      }

      if (chart2) {
        chart2.data.labels = labels;
        chart2.data.datasets[0] = dataset;
        chart2.update();
      } else {
        chart2 = new Chart(ctx2, { type: 'pie', data: { labels, datasets: [dataset] }, options: chartOptions });
      }

      feedbackSection.style.display = 'block';

    } catch (err) {
      console.error(err);
      resultsDiv.textContent = `An error occurred: ${err.message}`;
    }
  });

  showGaugesBtn.addEventListener('click', () => {
    if (!analysisData) return;

    // In the future, you would have different data for each model.
    // For now, we use the same `analysisData` regardless of choice.
    const chosenModel = document.querySelector('input[name="model-choice"]:checked').value;
    console.log(`User chose model ${chosenModel}`);

    gaugeWrap.innerHTML = '';
    analysisData.slice(0, 2).forEach(([lab]) => {
      const rgb = (emotionColors[lab] || getRandomColor(0.2))
        .match(/rgba?(\((\d+),\s*(\d+),\s*(\d+))/)
        .slice(1, 4).join(',');
      const holder = document.createElement('div');
      holder.style.display = 'flex';
      holder.style.flexDirection = 'column';
      holder.style.alignItems = 'center';
      gaugeWrap.appendChild(holder);
      buildGauge(holder, lab, rgb);
    });
  });
});

