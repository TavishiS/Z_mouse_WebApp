import torch
from transformers import pipeline
import warnings
from transformers import logging

# Suppress warnings and informational messages
warnings.filterwarnings("ignore", category=FutureWarning)
logging.set_verbosity_error()

# Auto-detect and set the device (GPU or CPU)
device = 0 if torch.cuda.is_available() else -1
print(f"Using device: {'GPU' if device == 0 else 'CPU'}")
# Load the pipeline
classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None,
    device=device
)
def emotion_dict(text):
    # Classify a sentence
    results = classifier(text)
    return results

if __name__ == "__main__":
    text = "I am so happy today! The sun is shining and everything feels great."
    results = emotion_dict(text)
    # Convert the result into the desired dictionary format
    emotion_percentages = {item['label']: round(item['score'] * 100, 2) for item in results[0]}
    # Print only the final dictionary
    print(emotion_percentages)