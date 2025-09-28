# 🎉 Z_mouse_WebApp

## 🚀 Overview

**Z_mouse_WebApp** is an interactive web application that analyzes your plain text and provides **two emotion predictions** from different models.  
Built with Python and Flask, it allows users to select the best emotion prediction using mouse buttons and submit confidence feedback, making it a simple yet powerful tool for emotion detection and user-driven model evaluation.

---

## ✨ Features

- 🎭 **Dual Emotion Prediction:** Provides emotion predictions from two separate models for the same input text.  
- 🖱️ **Interactive Model Selection:** Users select the preferred model using mouse buttons for easy and intuitive feedback.  
- 📊 **Confidence Feedback:** Users input a confidence percentage to indicate how accurate they think the chosen model’s prediction is, enabling feedback-driven improvements.  
- 🎨 **User-Friendly Interface:** Clean, minimalistic design for seamless interaction.  
- ⚙️ **Backend Powered by Python:** Robust processing and routing handled efficiently using Flask.  

---


## 🛠️ Technologies Used

| Frontend      | Backend      | Framework  |
| ------------- | ------------|------------|
| HTML, CSS, JS | Python       | Flask      |

---

## ⚡ Setup Instructions

### Prerequisites

- Python 3.12 or higher  
- pip (Python package installer)

### Installation Steps

1. **Clone the repository**
    ```bash
   git clone https://github.com/TavishiS/Z_mouse_WebApp.git
   cd Z_mouse_WebApp
    ```
2. **Install dependencies for linux users**
    ```bash
    pip install -r requirements.txt
    ```
    **Install dependencies for Windows users**
    ```bash
    pip install -r requirements_W.txt
    ```
3. **Run the application**
    ```bash
    python app.py
    ```
4. **For deployment (linux users only)** <br>
    gunicorn -b "ip_addr":"port" -w "num_workers" -t "num_threads"
    ```bash
    gunicorn -b 0.0.0.0:5000 -w 1 -t 2
    ```

## 🎯 Usage

1. Enter any text into the input field on the homepage.

2. The app generates **two emotion predictions** for the text, each from a different model.

3. You review both predictions and use your **mouse buttons** to select the model you think performed better.

4. After selecting, you provide a **confidence percentage** as feedback indicating how accurate you think the chosen model’s prediction is.

5. This feedback is recorded to help improve the models by tracking user confidence and preferences.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to fork the repo and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

