function getRandomColor(alpha) {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const emotionColors = {
    "joy": "rgba(255, 255, 0, 0.2)",       // Light Yellow
    "surprise": "rgba(255, 165, 0, 0.2)",  // Orange
    "sadness": "rgba(0, 0, 255, 0.2)",     // Blue
    "neutral": "rgba(128, 128, 128, 0.2)", // Gray
    "anger": "rgba(255, 0, 0, 0.2)",       // Red
    "disgust": "rgba(0, 128, 0, 0.2)",     // Green
    "fear": "rgba(128, 0, 128, 0.2)",      // Purple
    "Others": "rgba(0, 0, 0, 0.2)"         // Black
};

document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsDiv = document.getElementById('results');
    const canvas = document.getElementById('emotion-chart');
    const ctx = canvas.getContext('2d');
    let chart; // Will hold our Chart.js instance

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || `HTTP ${response.status}`);
            }
            const data = await response.json();

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

            // Text output
            const sorted = Object.entries(filteredData).sort(([, a], [, b]) => b - a);
            let out = 'Emotion Scores:\n\n';
            sorted.forEach(([label, score]) => out += `${label}: ${score.toFixed(1)}%\n`);
            resultsDiv.textContent = out;

            // Pie chart output
            const labels = sorted.map(([lab]) => lab);
            const vals = sorted.map(([, sc]) => sc);
            const dataset = {
                data: vals,
                backgroundColor: labels.map(label => emotionColors[label] || getRandomColor(0.2)),
                borderColor: '#555',
                borderWidth: 1.5
            };

            if (chart) {
                chart.data.labels = labels;
                chart.data.datasets[0] = dataset;
                chart.update();
            } else {
                chart = new Chart(ctx, {
                    type: 'pie',
                    data: { labels, datasets: [dataset] },
                    options: {
                        responsive: true,
                        plugins: { legend: { position: 'bottom' } }
                    }
                });
            }

        } catch (err) {
            console.error(err);
            resultsDiv.textContent = `An error occurred: ${err.message}`;
        }
    });
});