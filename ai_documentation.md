# Gemini AI Chatbot (Python)

## Overview

This project is a simple command-line AI chatbot built using Google's Gemini API and the official Google GenAI Python SDK.

The application loads the API key securely from a .env file, establishes a connection with the Gemini model, and allows users to have an interactive conversation directly from the terminal.

---

# Features

- Secure API key management using .env
- Uses Google's official google-genai SDK
- Interactive chat session
- Connection verification before starting
- Continuous conversation with chat history
- Simple command-line interface
- Graceful error handling

---

# Project Structure


Backend/
│
├── chatbot.py
├── .env
├── requirements.txt
└── README.md


---

# Requirements

- Python 3.10+
- Google Gemini API Key

---

# Required Packages

Install the dependencies:

bash
pip install google-genai python-dotenv


or

bash
pip install -r requirements.txt


---

# Environment Variables

Create a .env file inside the project directory.

Example:

env
GEMINI_API_KEY=YOUR_API_KEY_HERE


Replace:


YOUR_API_KEY_HERE


with your own Gemini API key.

---

# How It Works

## 1. Load Environment Variables

The application loads the API key from the .env file.

python
load_dotenv()


---

## 2. Read API Key

The key is retrieved using

python
os.getenv("GEMINI_API_KEY")


If the key is missing, the program immediately stops.

---

## 3. Create Gemini Client

A client object is created using the API key.

python
client = genai.Client(api_key=api_key)


---

## 4. Verify Connection

Before starting the chatbot, a simple request is sent to Gemini.

python
client.models.generate_content(...)


If successful, the chatbot starts.

---

## 5. Create Chat Session

python
chat = client.chats.create(
    model="gemini-2.5-flash"
)


This stores the conversation history automatically.

---

## 6. User Conversation Loop

The application repeatedly:

- waits for user input
- sends the message
- receives Gemini's response
- prints the response

until the user types


exit


---

# Program Flow


Start
   │
   ▼
Load .env
   │
   ▼
Read API Key
   │
   ▼
Create Gemini Client
   │
   ▼
Verify API Connection
   │
   ▼
Create Chat Session
   │
   ▼
Wait for User Input
   │
   ▼
Send Message to Gemini
   │
   ▼
Receive Response
   │
   ▼
Display Response
   │
   ▼
Exit?
 │       │
No       Yes
 │        │
 └────────┘


---

# Error Handling

The application checks for several possible errors.

## Missing API Key

If no API key exists:


ValueError:
GEMINI_API_KEY was not found


---

## Connection Errors

If Gemini cannot be reached:


Gemini connection failed


---

## Message Errors

If sending a message fails:


Message error:


The chatbot continues running instead of crashing.

---

# Technologies Used

- Python
- Google Gemini API
- Google GenAI SDK
- python-dotenv

---

# Advantages

- Lightweight
- Easy to understand
- Secure API key management
- Maintains chat history
- Suitable for beginners
- Easily extendable into desktop, web, or API applications

---

# Possible Future Improvements

- GUI using Tkinter or PyQt
- Web interface with Flask or FastAPI
- Streamlit chatbot
- Voice input/output
- Markdown response formatting
- Save conversation history
- Multi-user chat support
- Logging system
- Conversation export
- Streaming responses
- Support for image generation and analysis

---

# Example Session


==================================================
 Gemini Chat Bot is ready! Type 'exit' to quit.
==================================================

You: Hello

Gemini:
Hello! How can I help you today?

You: Explain Python decorators.

Gemini:
Python decorators are...

You: exit

Goodbye!


---

# Author

Developed using Python and Google's Gemini API.