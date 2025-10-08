# Z_mouse_WebApp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Framework](https://img.shields.io/badge/Flask-2.3.2-black.svg)](https://flask.palletsprojects.com/)

> An interactive web application for dual-model emotion analysis, featuring a unique mouse-based feedback system for user-driven model evaluation.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Z_mouse_WebApp is a web-based tool designed to analyze text and generate emotion predictions from two distinct machine learning models simultaneously. The core purpose of this application is to allow users to compare model outputs, select the more accurate prediction, and provide a quantitative confidence score for predicted emotion percentage. This feedback mechanism is designed to gather valuable data for evaluating and improving model performance over time.

## Key Features

-   **Dual Model Prediction**: Displays emotion predictions from two separate models for any given text input, allowing for direct comparison.
-   **Interactive Feedback System**: Utilizes left and right mouse clicks as an intuitive method for users to select the preferred model's prediction.
-   **Confidence Scoring**: Enables users to submit a confidence percentage to quantify the perceived accuracy of the chosen prediction.
-   **Data Collection**: Captures all user feedback, including model choice and confidence scores, to build a dataset for model analysis.
-   **Minimalist User Interface**: A clean and straightforward interface ensures ease of use and focuses on the core functionality.

## Technology Stack

-   **Backend**: Python
-   **Web Framework**: Flask
-   **Frontend**: HTML, CSS, JavaScript
-   **Production Server**: Gunicorn (for Linux environments)

---

## Installation

Follow these instructions to set up a local instance of the project.

#### **1. Prerequisites**
- Python 3.12 or higher
- pip (Python Package Installer)
- Git

#### **2. Clone the Repository**
```bash
git clone https://github.com/TavishiS/Z_mouse_WebApp.git
cd Z_mouse_WebApp
```
#### **3. Set Up a Virtual Environment (Recommended)**
- For macOS/Linux:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
- For Windows:
  ```bash
  python -m venv venv
  .\venv\Scripts\activate
  ```
#### **4. Install Dependencies**
- For macOS/Linux:
  ```bash
  pip install -r requirements.txt
  ```
- For Windows:
  ```bash
  pip install -r requirements_W.txt
  ```
#### **5. Run the Application**
```bash
python app.py
```

---

## Usage

1.  **Input Text**: Enter any text into the provided text area on the application's homepage.
2.  **Review Predictions**: The application will return two emotion predictions, one from each model.
3.  **Select a Model**:
4.  **Provide Confidence**: After selecting, set a confidence score (from 0 to 100) into the feedback field.
    -   Use the **left mouse button** to lower confidence.
    -   Use the **right mouse button** to increase confidence.
5.  **Submit**: Your selection and confidence score will be recorded for analysis.

---

## Contributing

Contributions are welcome. If you have suggestions for improving the project, please fork the repository and create a pull request. You can also open an issue with the "enhancement" tag.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/NewFeature`)
3.  Commit your Changes (`git commit -m 'Add some NewFeature'`)
4.  Push to the Branch (`git push origin feature/NewFeature`)
5.  Open a Pull Request

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
