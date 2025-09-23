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
  const model1ScoresDiv = document.getElementById('model1-scores');
  const model2ScoresDiv = document.getElementById('model2-scores');
  const ctx1 = document.getElementById('emotion-chart-1').getContext('2d');
  const ctx2 = document.getElementById('emotion-chart-2').getContext('2d');
  const gaugeWrap = document.getElementById('top-emotions');
  const feedbackSection = document.getElementById('feedback-section');
  const showGaugesBtn = document.getElementById('show-gauges-btn');

  let chart1 = null;
  let chart2 = null;
  let analysisDataModel1 = null; // Store data for Model 1
  let analysisDataModel2 = null; // Store data for Model 2

  

  analyzeBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
      model1ScoresDiv.textContent = 'Please enter some text to analyze.';
      model2ScoresDiv.textContent = '';
      return;
    }
    model1ScoresDiv.textContent = 'Analyzing…';
    model2ScoresDiv.textContent = 'Analyzing…';
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
      const allData = await resp.json(); // This now contains {model1: {...}, model2: {...}}

      // --- Process Model 1 Data ---
      let others1 = 0,
        filtered1 = {};
      for (const [lab, sc] of Object.entries(allData.model1)) {
        sc < 3 ? others1 += sc: filtered1[lab] = sc;
      }
      if (others1) filtered1.Others = others1;
      const sorted1 = Object.entries(filtered1).sort((a, b) => b[1] - a[1]);
      analysisDataModel1 = sorted1;

      const scoreText1 = 'Emotion Scores:\n\n' +
        sorted1.map(([l, s]) => `${l}: ${s.toFixed(1)}%`).join('\n');
      model1ScoresDiv.textContent = scoreText1;

      const labels1 = sorted1.map(([l]) => l);
      const values1 = sorted1.map(([, s]) => s);

      const dataset1 = {
        data: values1,
        backgroundColor: labels1.map(l => emotionColors[l] || getRandomColor(0.2)),
        borderColor: '#555',
        borderWidth: 1.5
      };

      const chartOptions = {
          responsive: true,
          plugins: { legend: { position:'bottom' } }
      };

      if (chart1) {
        chart1.data.labels = labels1;
        chart1.data.datasets[0] = dataset1;
        chart1.update();
      } else {
        chart1 = new Chart(ctx1, { type: 'pie', data: { labels: labels1, datasets: [dataset1] }, options: chartOptions });
      }

      // --- Process Model 2 Data ---
      let others2 = 0,
        filtered2 = {};
      for (const [lab, sc] of Object.entries(allData.model2)) {
        sc < 3 ? others2 += sc: filtered2[lab] = sc;
      }
      if (others2) filtered2.Others = others2;
      const sorted2 = Object.entries(filtered2).sort((a, b) => b[1] - a[1]);
      analysisDataModel2 = sorted2;

      const scoreText2 = 'Emotion Scores:\n\n' +
        sorted2.map(([l, s]) => `${l}: ${s.toFixed(1)}%`).join('\n');
      model2ScoresDiv.textContent = scoreText2;

      const labels2 = sorted2.map(([l]) => l);
      const values2 = sorted2.map(([, s]) => s);

      const dataset2 = {
        data: values2,
        backgroundColor: labels2.map(l => emotionColors[l] || getRandomColor(0.2)),
        borderColor: '#555',
        borderWidth: 1.5
      };

      if (chart2) {
        chart2.data.labels = labels2;
        chart2.data.datasets[0] = dataset2;
        chart2.update();
      } else {
        chart2 = new Chart(ctx2, { type: 'pie', data: { labels: labels2, datasets: [dataset2] }, options: chartOptions });
      }

      feedbackSection.style.display = 'block';

    } catch (err) {
      console.error(err);
      model1ScoresDiv.textContent = `An error occurred: ${err.message}`;
      model2ScoresDiv.textContent = '';
    }
  });

  showGaugesBtn.addEventListener('click', () => {
    if (!analysisDataModel1 || !analysisDataModel2) return;

    const chosenModel = document.querySelector('input[name="model-choice"]:checked').value;
    const dataForGauges = (chosenModel === '1') ? analysisDataModel1 : analysisDataModel2;
    console.log(`User chose model ${chosenModel}`);

    gaugeWrap.innerHTML = '';
    dataForGauges.slice(0, 2).forEach(([lab]) => {
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

