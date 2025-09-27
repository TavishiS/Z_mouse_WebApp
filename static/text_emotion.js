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
  const textInput       = document.getElementById('text-input');
  const analyzeBtn      = document.getElementById('analyze-btn');
  const model1ScoresDiv = document.getElementById('model1-scores');
  const model2ScoresDiv = document.getElementById('model2-scores');
  const ctx1            = document.getElementById('emotion-chart-1').getContext('2d');
  const ctx2            = document.getElementById('emotion-chart-2').getContext('2d');
  const gaugeWrap       = document.getElementById('top-emotions');
  const feedbackSection = document.getElementById('feedback-section');
  const submitChoiceBtn = document.getElementById('submit-choice-btn');
  const showGaugesBtn   = document.getElementById('show-gauges-btn');
  const model_question = document.getElementById('question');

  let chart1 = null;
  let chart2 = null;
  let analysisDataModel1 = null;
  let analysisDataModel2 = null;
  let chosenModel = null; // store user's model selection


  /* ---- Analyze Text ---- */
  analyzeBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
      model1ScoresDiv.textContent = 'Please enter some text to analyze.';
      model2ScoresDiv.textContent = '';
      return;
    }

    // Reset UI
    model1ScoresDiv.textContent = 'Analyzing…';
    model2ScoresDiv.textContent = 'Analyzing…';
    gaugeWrap.innerHTML = '';
    feedbackSection.style.display = 'none';
    showGaugesBtn.style.display = 'none';

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

      const allData = await resp.json(); // {model1: {...}, model2: {...}}

      // --- Process Model 1 ---
      const sorted1 = processModelData(allData.model1);
      analysisDataModel1 = sorted1;
      model1ScoresDiv.textContent = formatScores(sorted1);
      chart1 = updatePieChart(chart1, ctx1, sorted1);

      // --- Process Model 2 ---
      const sorted2 = processModelData(allData.model2);
      analysisDataModel2 = sorted2;
      model2ScoresDiv.textContent = formatScores(sorted2);
      chart2 = updatePieChart(chart2, ctx2, sorted2);

      feedbackSection.style.display = 'block';
    } catch (err) {
      console.error(err);
      model1ScoresDiv.textContent = `An error occurred: ${err.message}`;
      model2ScoresDiv.textContent = '';
    }
  });

  /* ---- Submit User's Model Choice ---- */
  submitChoiceBtn.addEventListener('click', () => {
    const selected = document.querySelector('input[name="model-choice"]:checked');
    if (selected===null) {
      alert('Please select a model before submitting.');
      return;
    }

    const tempChoice = selected.value;
    // ✅ Ask for confirmation
    const confirmChoice = confirm(`Are you sure you want to select Model ${tempChoice}?`);
    if (!confirmChoice) return;

    // ✅ If confirmed, lock the choice
    chosenModel = tempChoice;
    // alert(`You confirmed Model ${chosenModel} as your choice.`);


    //...............Sending selected model number to database.py................//

    fetch('/process_var', {
      method: 'POST',
      headers: { 'Content-Type' : 'application/json'},
      body: JSON.stringify({model: chosenModel})
    })

    .then(res => res.json())
    .then(data => console.log("Python responded : ", data))
    .catch(err => console.error(err))

    //...........................................................................//

    // ✅ Display selected model
    const selectedModel = document.getElementById('selected-model');
    selectedModel.textContent = `You selected Model ${chosenModel}`;
    selectedModel.style.display = 'inline-block';
    // Hide radio buttons and submit button so user cannot change
    model_question.style.display = 'none';
    document.querySelectorAll('input[name="model-choice"]').forEach(r => {
      r.closest('label').style.display = 'none';
    });
    submitChoiceBtn.style.display = 'none';

    // Show the gauges button
    showGaugesBtn.style.display = 'inline-block';
  });

  /* ---- Show Surity Gauges ---- */
  showGaugesBtn.addEventListener('click', () => {
    if (!chosenModel) {
      alert('Please submit your model choice first.');
      return;
    }

    const dataForGauges = chosenModel === '1' ? analysisDataModel1 : analysisDataModel2;
    gaugeWrap.innerHTML = '';

    // Show top 2 emotions
    let gaugeHolders = []; // to store gauge objects

    dataForGauges.slice(0, 2).forEach(([lab]) => {
    const rgb = (emotionColors[lab] || getRandomColor(0.2))
      .match(/\((\d+),\s*(\d+),\s*(\d+)/)
      .slice(1, 4).join(',');
    const holder = document.createElement('div');
    holder.style.display = 'flex';
    holder.style.flexDirection = 'column';
    holder.style.alignItems = 'center';
    gaugeWrap.appendChild(holder);

    const gaugeObj = buildGauge(holder, lab, rgb); // returns { getSurity }
    gaugeHolders.push({ label: lab, gaugeObj });
});

// Show submit button
document.getElementById('submit-surity-btn').style.display = 'inline-block';

// Submit Surity Settings
const submitSurityBtn = document.getElementById('submit-surity-btn');
submitSurityBtn.addEventListener('click', () => {
  const confirmSubmit = confirm("Are you sure you want to submit these surity settings?");
  if(!confirmSubmit) return;

  const surityData = gaugeHolders.map(g => ({ emotion: g.label, surity: g.gaugeObj.getSurity() }));

  fetch('/submit_surity', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ model: chosenModel, surity: surityData })
  })
  .then(res=>res.json())
  .then(data=>{
    console.log("Response from Flask:", data);
    alert("Your surity settings have been submitted!");
    submitSurityBtn.disabled=true;
  })
  .catch(err=>console.error(err));
})

  });

  /* ---- Helper Functions ---- */
  function processModelData(modelData) {
    let others = 0;
    const filtered = {};
    for (const [lab, sc] of Object.entries(modelData)) {
      sc < 3 ? others += sc : filtered[lab] = sc;
    }
    if (others) filtered.Others = others;
    return Object.entries(filtered).sort((a, b) => b[1] - a[1]);
  }

  function formatScores(data) {
    return 'Emotion Scores:\n\n' + data.map(([l, s]) => `${l}: ${s.toFixed(1)}%`).join('\n');
  }

  function updatePieChart(chart, ctx, sorted) {
    const labels = sorted.map(([l]) => l);
    const values = sorted.map(([, s]) => s);
    const dataset = {
      data: values,
      backgroundColor: labels.map(l => emotionColors[l] || getRandomColor(0.2)),
      borderColor: '#555',
      borderWidth: 1.5
    };
    const chartOptions = { responsive: true, plugins: { legend: { position: 'bottom' } } };

    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0] = dataset;
      chart.update();
      return chart;
    }
    return new Chart(ctx, { type: 'pie', data: { labels, datasets: [dataset] }, options: chartOptions });
  }
});
