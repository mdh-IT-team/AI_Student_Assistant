# AI Student Assistant

This repository contains the full-stack code for the AI Student Assistant. The project is designed to help students study, manage tasks, and track progress using AI. It is split into a React frontend and a secure FastAPI (Python) backend connected to a Supabase database.

## Repository Structure
* `/Backend` - FastAPI server, JWT security logic, and Supabase database integration.
* `/frontend` - React (Vite) application, authentication state, and protected routing.

---

## Part 1: Backend Setup (FastAPI)

The backend handles user authentication, secure route management via JWTs, and database interactions.

### Prerequisites
* **Python 3.8+**
* A **Supabase** project

### 1. Environment Setup
You need to provide your local server with your Supabase connection strings.
Create a new file named `.env` inside the `Backend/` directory and add your credentials:

```
SUPABASE_URL="your-supabase-project-url-here"
SUPABASE_KEY="your-supabase-anon-key-here"
```

### 2. Installation (Virtual Environment)
It is highly recommended to use a virtual environment so you don't clutter your global Python installation. Open your terminal and navigate to the backend folder:

```
cd Backend
```

Create and activate the virtual environment:

**On Mac/Linux:**
```
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```
python -m venv venv
venv\Scripts\activate
```

With the virtual environment active, install the required dependencies:

```
pip install fastapi "uvicorn[standard]" supabase pydantic python-dotenv
```

### 3. Running the Server
Once everything is installed, start the FastAPI development server:

```
python3 main.py
```

The backend server will run on `http://localhost:8000`. You can test the API endpoints and the JWT security guard interactively by visiting the built-in Swagger UI at http://localhost:8000/docs.

### 4. Verified API Endpoints
The following endpoints have been fully integrated, secured, and tested. You can interact with these directly via the Swagger UI or your frontend client. 

**Public Routes (No Authentication Required)**
* **`GET /`** : Health check to confirm the server is running and actively connected to the Supabase instance.
* **`GET /test`** : A simple developer test route to verify standard JSON responses.
* **`POST /auth/register`** : Accepts a JSON payload (`email`, `password`) to create a new user. Includes explicit validation to catch and reject duplicate email registrations gracefully.
* **`POST /auth/login`** : Authenticates a user and returns a secure JWT access token alongside the user ID.
* **`POST /logout`** : Terminates the active Supabase authentication session.

**Protected Routes (Require JWT Authentication)**
*Note: Requests to these endpoints must include a valid JWT in the headers: `Authorization: Bearer <your_token>`.*

* **`GET /api/me`** : Extracts the authenticated user from the provided JWT and returns a safe data payload (ID, email, role, account creation date) without exposing sensitive background metadata. Handles invalid, missing, or expired tokens with a strict `401 Unauthorized` response.
* **`GET /api/dashboard`** : A customized, fully authenticated route that queries the custom database schema. It joins core account information from the `users` table with specific academic details (semester, studying modules, teaching modules) from the `profile` table to deliver a compiled dashboard payload.
---

## Part 2: Frontend Setup (React + Vite)

The frontend handles the user interface, authentication state management, and protected routing.

### Prerequisites
* **Node.js 18+**
* **npm**

### 1. Installation
The following commands are the same on Mac, Linux, and Windows. Open your terminal and navigate to the frontend folder:

```
cd frontend
```

Install the required dependencies:

```
npm install
```

### 2. Running the App
Once everything is installed, start the Vite development server:

```
npm run dev
```

The frontend will run on `http://localhost:5173`. Open this URL in your browser to use the application.
