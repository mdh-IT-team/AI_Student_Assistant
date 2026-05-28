# AI Student Assistant

This repository contains the full-stack code for the AI Student Assistant. The project is designed to help students study, manage tasks, and track progress using AI. It is split into a React frontend and a secure FastAPI (Python) backend connected to a Supabase database.

## Repository Structure
* `/Backend` - FastAPI server, JWT security logic, and Supabase database integration.


---

## Part 1: Backend Setup (FastAPI)

The backend handles user authentication, secure route management via JWTs, and database interactions.

### Prerequisites
* **Python 3.8+**
* A **Supabase** project 

### 1. Environment Setup
You need to provide your local server with your Supabase connection strings.
Create a new file named `.env` inside the `Backend/` directory and add your credentials:

    SUPABASE_URL="your-supabase-project-url-here"
    SUPABASE_KEY="your-supabase-anon-key-here"


### 2. Installation (Virtual Environment)
It is highly recommended to use a virtual environment so you don't clutter your global Python installation. Open your terminal and navigate to the backend folder:

    cd Backend

Create and activate the virtual environment:

**On Mac/Linux:**
    python3 -m venv venv
    source venv/bin/activate

**On Windows:**
    python -m venv venv
    venv\Scripts\activate

With the virtual environment active, install the required dependencies:
    pip install fastapi "uvicorn[standard]" supabase pydantic python-dotenv

### 3. Running the Server
Once everything is installed, start the FastAPI development server:

    python3 main.py

The backend server will run on `http://localhost:8000`. You can test the API endpoints and the JWT security guard interactively by visiting the built-in Swagger UI at **http://localhost:8000/docs**.

---
