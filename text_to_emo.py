import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import warnings
from transformers import logging
import socket

# Suppress warnings and informational messages
warnings.filterwarnings("ignore", category=FutureWarning)
logging.set_verbosity_error()

# --- Helper function to check for an active internet connection ---
def is_internet_available():
    """Checks for a live internet connection by connecting to a reliable host."""
    try:
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        return True
    except OSError:
        return False

# Auto-detect and set the device (GPU or CPU)
device = 0 if torch.cuda.is_available() else -1
print(f"Using device: {'GPU' if device == 0 else 'CPU'}")

# Initialize models as None.
classifier_model1 = None
classifier_model2 = None

# --- Load Model 1 with internet check fallback ---
if classifier_model1 is None:
    model_name = "j-hartmann/emotion-english-distilroberta-base"
    try:
        # print("Attempting to load Model 1 from local files...")
        tokenizer = AutoTokenizer.from_pretrained(model_name, local_files_only=True)
        model = AutoModelForSequenceClassification.from_pretrained(model_name, local_files_only=True)
        classifier_model1 = pipeline("text-classification", model=model, tokenizer=tokenizer, device=device, top_k=None)
        print("Model 1 loaded successfully from cache.")
    except OSError:
        print("Model 1 not found in cache. Checking for internet...")
        if is_internet_available():
            print("Internet connection found. Attempting to download Model 1...")
            try:
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                model = AutoModelForSequenceClassification.from_pretrained(model_name)
                classifier_model1 = pipeline("text-classification", model=model, tokenizer=tokenizer, device=device, top_k=None)
            except Exception as e:
                print(f"An error occurred during model download: {e}")
        else:
            print("No internet connection. Cannot download Model 1.")

# --- Load Model 2 with internet check fallback ---
if classifier_model2 is None:
    model_name = "bhadresh-savani/distilbert-base-uncased-emotion"
    try:
        print("Attempting to load Model 2 from local files...")
        tokenizer = AutoTokenizer.from_pretrained(model_name, local_files_only=True)
        model = AutoModelForSequenceClassification.from_pretrained(model_name, local_files_only=True)
        classifier_model2 = pipeline("text-classification", model=model, tokenizer=tokenizer, device=device, top_k=None)
        print("Model 2 loaded successfully from cache.")
    except OSError:
        print("Model 2 not found in cache. Checking for internet...")
        if is_internet_available():
            print("Internet connection found. Attempting to download Model 2...")
            try:
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                model = AutoModelForSequenceClassification.from_pretrained(model_name)
                classifier_model2 = pipeline("text-classification", model=model, tokenizer=tokenizer, device=device, top_k=None)
            except Exception as e:
                print(f"An error occurred during model download: {e}")
        else:
            print("No internet connection. Cannot download Model 2.")
            
def get_emotion_scores_for_models(text):
    global classifier_model1, classifier_model2

    # --- Load Model 1 with internet check fallback ---
    if classifier_model1 is None:
        model_name = "j-hartmann/emotion-english-distilroberta-base"
        try:
            print("Attempting to load Model 1 from local files...")
            tokenizer = AutoTokenizer.from_pretrained(model_name, local_files_only=True)
            model = AutoModelForSequenceClassification.from_pretrained(model_name, local_files_only=True)
            classifier_model1 = pipeline("text-classification", model=model, tokenizer=tokenizer, device=device, top_k=None)
            print("Model 1 loaded successfully from cache.")
        except OSError:
            print("Model 1 not found in cache. Checking for internet...")
            if is_internet_available():
                print("Internet connection found. Attempting to download Model 1...")
                try:
                    tokenizer = AutoTokenizer.from_pretrained(model_name)
                    model = AutoModelForSequenceClassification.from_pretrained(model_name)
                    classifier_model1 = pipeline("text-classification", model=model, tokenizer=tokenizer, device=device, top_k=None)
                except Exception as e:
                    print(f"An error occurred during model download: {e}")
                    return {"error": "Model 1 download failed."}
            else:
                print("No internet connection. Cannot download Model 1.")
                return {"error": "Model 1 is not available offline."}

    # --- Load Model 2 with internet check fallback ---
    if classifier_model2 is None:
        model_name = "bhadresh-savani/distilbert-base-uncased-emotion"
        try:
            print("Attempting to load Model 2 from local files...")
            tokenizer = AutoTokenizer.from_pretrained(model_name, local_files_only=True)
            model = AutoModelForSequenceClassification.from_pretrained(model_name, local_files_only=True)
            classifier_model2 = pipeline("text-classification", model=model, tokenizer=tokenizer, device=device, top_k=None)
            print("Model 2 loaded successfully from cache.")
        except OSError:
            print("Model 2 not found in cache. Checking for internet...")
            if is_internet_available():
                print("Internet connection found. Attempting to download Model 2...")
                try:
                    tokenizer = AutoTokenizer.from_pretrained(model_name)
                    model = AutoModelForSequenceClassification.from_pretrained(model_name)
                    classifier_model2 = pipeline("text-classification", model=model, tokenizer=tokenizer, device=device, top_k=None)
                except Exception as e:
                    print(f"An error occurred during model download: {e}")
                    return {"error": "Model 2 download failed."}
            else:
                print("No internet connection. Cannot download Model 2.")
                return {"error": "Model 2 is not available offline."}

    # --- If models are loaded, proceed with classification ---
    results_model1 = classifier_model1(text)
    formatted_results_model1 = {item['label']: round(item['score'] * 100, 2) for item in results_model1[0]}

    results_model2 = classifier_model2(text)
    formatted_results_model2 = {item['label']: round(item['score'] * 100, 2) for item in results_model2[0]}

    return {
        "model1": formatted_results_model1,
        "model2": formatted_results_model2
    }

if __name__ == "__main__":
    text = "I am so happy today! The sun is shining and everything feels great."
    all_results = get_emotion_scores_for_models(text)
    print("Model 1 Results:", all_results.get("model1"))
    print("Model 2 Results:", all_results.get("model2"))