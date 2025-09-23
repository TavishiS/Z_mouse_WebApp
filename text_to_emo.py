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

# Load Model 1
classifier_model1 = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None,
    device=device
)

# Load Model 2
classifier_model2 = pipeline(
    "text-classification",
    model="bhadresh-savani/distilbert-base-uncased-emotion",
    top_k=None,
    device=device
)

def get_emotion_scores_for_models(text):
    # Classify text using Model 1
    results_model1 = classifier_model1(text)
    formatted_results_model1 = {item['label']: round(item['score'] * 100, 2) for item in results_model1[0]}

    # Classify text using Model 2
    results_model2 = classifier_model2(text)
    formatted_results_model2 = {item['label']: round(item['score'] * 100, 2) for item in results_model2[0]}

    return {
        "model1": formatted_results_model1,
        "model2": formatted_results_model2
    }

if __name__ == "__main__":
    text = "I am so happy today! The sun is shining and everything feels great."
    all_results = get_emotion_scores_for_models(text)
    print("Model 1 Results:", all_results["model1"])
    print("Model 2 Results:", all_results["model2"])