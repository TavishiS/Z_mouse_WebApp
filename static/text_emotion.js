import { buildGauge } from './circle_gauge.js';

const emotionColors = {
  joy: 'rgba(255, 255, 0, 0.4)',
  surprise: 'rgba(255, 165, 0, 0.4)',
  sadness: 'rgba(0, 0, 255, 0.4)',
  neutral: 'rgba(128, 128, 128, 0.4)',
  anger: 'rgba(255, 0, 0, 0.4)',
  disgust: 'rgba(0, 128, 0, 0.4)',
  fear: 'rgba(128, 0, 128, 0.4)',
  Others: 'rgba(0, 0, 0, 0.4)'
};

function getRandomColor(alpha) {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const textInput = document.getElementById('text-input');
  const analyzeBtn = document.getElementById('analyze-btn');
  const chartsContainer = document.getElementById('charts-container');
  const model1ScoresDiv = document.getElementById('model1-scores');
  const model2ScoresDiv = document.getElementById('model2-scores');
  const ctx1 = document.getElementById('emotion-chart-1').getContext('2d');
  const ctx2 = document.getElementById('emotion-chart-2').getContext('2d');
  const feedbackSection = document.getElementById('feedback-section');
  const submitChoiceBtn = document.getElementById('submit-choice-btn');
  const selectedModelP = document.getElementById('selected-model');
  const questionH3 = document.getElementById('question');
  const showGaugesBtn = document.getElementById('show-gauges-btn');
  const gaugeWrap = document.getElementById('top-emotions');
  const submitSurityBtn = document.getElementById('submit-surety-btn');
  const thankYouMsg = document.getElementById('thank-you-msg');

  // State variables
  let chart1 = null;
  let chart2 = null;
  let analysisDataModel1 = null;
  let analysisDataModel2 = null;
  let chosenModel = null;
  let gaugeHolders = [];

  // ---- Event Listener for Analyze Button ----
  analyzeBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
      model1ScoresDiv.textContent = 'Please enter some text to analyze.';
      return;
    }

    chartsContainer.style.display = 'flex';
    model1ScoresDiv.textContent = 'Analyzing…';
    model2ScoresDiv.textContent = 'Analyzing…';
    gaugeWrap.innerHTML = '';
    feedbackSection.style.display = 'none';

    try {
      const resp = await fetch('/text_to_emo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }
      
      const allData = await resp.json();
      
      analysisDataModel1 = processModelData(allData.model1);
      model1ScoresDiv.textContent = formatScores(analysisDataModel1);
      chart1 = updatePieChart(chart1, ctx1, analysisDataModel1);

      analysisDataModel2 = processModelData(allData.model2);
      model2ScoresDiv.textContent = formatScores(analysisDataModel2);
      chart2 = updatePieChart(chart2, ctx2, analysisDataModel2);

      feedbackSection.style.display = 'block';

    } catch (err) {
      console.error('Analysis Error:', err);
      model1ScoresDiv.textContent = `An error occurred: ${err.message}`;
    }
  });

  // ---- Event Listener for Model Choice Submission ----
  submitChoiceBtn.addEventListener('click', () => {
    const selected = document.querySelector('input[name="model-choice"]:checked');
    if (!selected) {
      alert('Please select a model before submitting.');
      return;
    }
    chosenModel = selected.value;

    selectedModelP.textContent = `You selected Model ${chosenModel}`;
    selectedModelP.style.display = 'block';
    
    questionH3.style.display = 'none';
    document.querySelectorAll('input[name="model-choice"]').forEach(r => {
      r.closest('label').style.display = 'none';
    });
    submitChoiceBtn.style.display = 'none';
    
    showGaugesBtn.click(); // Automatically trigger gauge creation
  });

  // ---- Event Listener for Showing surety Gauges ----
  showGaugesBtn.addEventListener('click', () => {
    if (!chosenModel) {
      alert('Please submit your model choice first.');
      return;
    }
    const dataForGauges = chosenModel === '1' ? analysisDataModel1 : analysisDataModel2;
    gaugeWrap.innerHTML = '';
    gaugeHolders = []; // Reset gauge holders

    dataForGauges.slice(0, 2).forEach(([label]) => {
      const rgb = (emotionColors[label] || getRandomColor(0.2))
        .match(/\((\d+),\s*(\d+),\s*(\d+)/)
        .slice(1, 4).join(',');
        
      const holder = document.createElement('div');
      holder.style.cssText = 'display: flex; flex-direction: column; align-items: center;';
      gaugeWrap.appendChild(holder);
      
      const gaugeObj = buildGauge(holder, label, rgb);
      gaugeHolders.push({ label, gaugeObj });
    });
    
    showGaugesBtn.style.display = 'none';
    submitSurityBtn.style.display = 'block';
  });

  // ---- Event Listener for Final surety Submission ----
  submitSurityBtn.addEventListener('click', () => {
    if (!confirm("Are you sure you want to submit these surety settings?")) return;

    const surityData = gaugeHolders.map(g => ({
      emotion: g.label,
      surety: g.gaugeObj.getSurity()
    }));

    fetch('/submit_feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: chosenModel, surety: surityData })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Feedback submitted:", data);
      submitSurityBtn.style.display = 'none';
      thankYouMsg.style.display = 'block';
    })
    .catch(err => console.error('Feedback Submission Error:', err));
  });

  // ---- Helper Functions ----
  function processModelData(modelData) {
    let others = 0;
    const filtered = {};
    for (const [label, score] of Object.entries(modelData)) {
      score < 3 ? (others += score) : (filtered[label] = score);
    }
    if (others > 0) filtered.Others = others;
    return Object.entries(filtered).sort((a, b) => b[1] - a[1]);
  }

  function formatScores(data) {
    return 'Emotion Scores:\n\n' + data.map(([label, score]) => `${label}: ${score.toFixed(1)}%`).join('\n');
  }

  function updatePieChart(chart, ctx, sortedData) {
    const labels = sortedData.map(([label]) => label);
    const values = sortedData.map(([, score]) => score);
    const dataset = {
      data: values,
      backgroundColor: labels.map(l => emotionColors[l] || getRandomColor(0.2)),
      borderColor: '#555',
      borderWidth: 1.5
    };

    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0] = dataset;
      chart.update();
      return chart;
    }
    
    return new Chart(ctx, {
      type: 'pie',
      data: { labels, datasets: [dataset] },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }
});