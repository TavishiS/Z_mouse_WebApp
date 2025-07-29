document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsDiv = document.getElementById('results');

    analyzeBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            resultsDiv.textContent = 'Please enter some text to analyze.';
            return;
        }

        resultsDiv.textContent = 'Analyzing...';

        try {
            const response = await fetch('/text_to_emo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const results = await response.json();

            // The API returns a dictionary: {joy: 99.81, sadness: 0.05, ...}
            // Let's format this for a nice display.
            let formattedResults = "Emotion Scores:\n\n";

            // Convert the results object to an array, sort it by score, and format it.
            const sortedEmotions = Object.entries(results)
                .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

            if (sortedEmotions.length > 0) {
                sortedEmotions.forEach(([label, score]) => {
                    formattedResults += `${label}: ${score}%\n`;
                });
            }
            resultsDiv.textContent = formattedResults;
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.textContent = `An error occurred: ${error.message}`;
        }
    });
});