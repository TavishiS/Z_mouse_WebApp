function getRandomColor(alpha) {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getRandomColor(alpha) {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
}

const emotionColors = {
    "joy": "rgba(255, 255, 0, 0.2)",       // Light Yellow
    "surprise": "rgba(255, 165, 0, 0.2)",  // Orange
    "sadness": "rgba(0, 0, 255, 0.2)",     // Blue
    "neutral": "rgba(128, 128, 128, 0.2)", // Gray
    "anger": "rgba(255, 0, 0, 0.2)",       // Red
    "disgust": "rgba(0, 128, 0, 0.2)",     // Green
    "fear": "rgba(128, 0, 128, 0.2)",      // Purple
    "Others": "rgba(0, 0, 0, 0.2)"         // Black"
};
document.addEventListener('DOMContentLoaded', () => {
    const textInput  = document.getElementById('text-input');
    const analyzeBtn = document.getElementById('analyze-btn');
  const resultsDiv = document.getElementById('results');

  // create a container & canvas for the pie chart
  const chartContainer = document.createElement('div');
  chartContainer.style.marginTop = '20px';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  chartContainer.appendChild(canvas);
  resultsDiv.parentNode.insertBefore(chartContainer, resultsDiv.nextSibling);

  let chart; // will hold our Chart.js instance

  analyzeBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
      resultsDiv.textContent = 'Please enter some text to analyze.';
      return;
    }
    resultsDiv.textContent = 'Analyzing…';

    try {
      const response = await fetch('/text_to_emo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ text })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }
      const data = await response.json(); // e.g. { joy: 88.0, sadness: 4.2, … }

      // Group emotions with score < 3 into "Others"
      let othersScore = 0;
      const filteredData = {};
      for (const [label, score] of Object.entries(data)) {
        if (score < 3) {
          othersScore += score;
        } else {
          filteredData[label] = score;
        }
      }
      if (othersScore > 0) {
        filteredData["Others"] = othersScore;
      }

      // text output
      const sorted = Object.entries(filteredData).sort(([,a],[,b]) => b - a);
      let out = 'Emotion Scores:\n\n';
      sorted.forEach(([label,score]) => out += `${label}: ${score}%\n`);
      resultsDiv.textContent = out;

      // pie‐chart output
      const labels = sorted.map(([lab]) => lab);
      const vals   = sorted.map(([,sc]) => sc);
      const dataset = {
        data: vals,
        backgroundColor: vals.map(() => 'rgba(0,0,0,0)'), // transparent

        borderColor: '#555',
        borderWidth: 1.5
      };

      dataset.backgroundColor = labels.map(label => {
                if (emotionColors[label]) {
                    return emotionColors[label];
                } else return getRandomColor(0.3);
            });
      if (chart) {
        chart.data.labels = sorted.map(([lab]) => lab);
        chart.data.datasets[0] = dataset;
        chart.update();
      } else {
        chart = new Chart(ctx, {
          type: 'pie',
          data: { labels, datasets: [dataset] },
          options: { plugins: { legend: { position: 'bottom' } } }
        });
      }

    } catch (err) {
        console.error(err);
      resultsDiv.textContent = `An error occurred: ${err.message}`;
    }
  });
});
