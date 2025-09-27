from flask import Flask, request, jsonify, render_template
from text_to_emo import get_emotion_scores_for_models
import database

app = Flask(__name__)

### CIRCUMPLEX MODEL DEMONSTRATION SECTION -------------------------------------------

# Emotion labels from Russell's circumplex model
emotions = [
    "Pleased", "Glad", "Happy", "Delighted", "Excited", "Astonished", "Aroused",
    "Tense", "Alarmed", "Afraid", "Angry", "Annoyed", "Distressed", "Frustrated",
    "Miserable", "Sad", "Gloomy", "Depressed", "Bored", "Droopy", "Tired", "Sleepy",
    "Calm", "Relaxed", "Satisfied", "At Ease", "Content", "Serene"
]
angle_step = 360 / len(emotions)
angle_emotion_map = {int(i * angle_step): emotions[i] for i in range(len(emotions))}

def get_closest_emotion(angle):
    closest = min(angle_emotion_map.keys(), key=lambda a: abs(a - angle))
    return angle_emotion_map[closest]

def get_certainty_label(hold_time):
    if hold_time >= 2:
        return "very sure", 1.0
    elif hold_time >= 1:
        return "sure", 0.66
    else:
        return "uncertain", 0.33

@app.route("/circumplex_model")
def home():
    return render_template("circumplex_model.html")

@app.route("/process_circumplex_model", methods=["POST"])
def process():
    data = request.json
    angle = data["angle"]
    hold_time = data["hold_time"]
    emotion = get_closest_emotion(angle)
    label, score = get_certainty_label(hold_time)
    return jsonify({
        "emotion": emotion,
        "certainty_label": label,
        "certainty_score": score
    })

### CIRCUMPLEX MODEL DEMONSTRATION SECTION END ----------------------------------

### MAIN PROJECT SECTION --------------------------------------------------------

@app.route("/")
def text_emotion_page():
    return render_template("text_emotion.html")

@app.route("/text_to_emo", methods=["POST"])
def text_to_emo():
    text = request.json.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400
    all_results = get_emotion_scores_for_models(text)
    return jsonify(all_results)

### MAIN PROJECT SECTION END ---------------------------------------------------------

@app.route("/submit_feedback", methods=["POST"])
def submit_feedback():
    data = request.json
    model_selected = data.get("model")
    surity_settings = data.get("surity")  # list of dicts: [{emotion, surity}, ...]

    print("Model selected:", model_selected)
    print("Surity settings:", surity_settings)

    # Later: you can forward this data to database.py
    return jsonify({"status": "success", "message": "Surity settings received"})


if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0", threaded=True)