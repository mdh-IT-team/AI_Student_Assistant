import os
from fastapi import FastAPI, Depends
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

URL: str = os.environ.get("SUPABASE_URL")
KEY: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(URL, KEY)

app = FastAPI()

# --- Import Security Dependency ---
# This import has to happen AFTER supabase is initialized above
from security import verify_jwt

class LoginData(BaseModel):
    email: str
    password: str

@app.get("/test")
def test_route():
    return {
        "status": "Success",
        "message": "The test route is working perfectly!",
        "developer": "Alex"
    }

@app.get("/")
def check_status():
    return {"message": "The AI Student Assistant server is running and connected to Supabase!"}


# =========================================================================
# TASK: Test duplicate email validation & Registration
# =========================================================================
@app.post("/auth/register")
def register(user_data: LoginData):
    try:
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        return {"status": "Success", "message": "User registered successfully!"}

    except Exception as e:
        error_message = str(e)
        # Catches standard string matches or common API error messages from Supabase
        if "already registered" in error_message.lower() or "already exists" in error_message.lower():
            return {"status": "Error", "message": "Validation Failed: This email is already registered."}
        else:
            return {"status": "Error", "message": error_message}


# =========================================================================
# TASK: Create login query (JIRA Implementation Complete)
# =========================================================================
@app.post("/auth/login")
def login(user_data: LoginData):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })

        return {
            "status": "Success",
            "token": response.session.access_token,
            "user_id": response.user.id
        }
    except Exception as e:
        return {"status": "Error", "message": "Wrong email or password"}


@app.post("/logout")
def logout():
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully."}
    except Exception as e:
        return {"status": "Error", "message": str(e)}


# =========================================================================
# TASK: Create user lookup query
# Fetches public profile row from your database matching a specific user ID
# =========================================================================
@app.get("/api/users/{user_id}", dependencies=[Depends(verify_jwt)])
def lookup_user_profile(user_id: str):
    try:
        # Queries your public profiles table for the match
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()

        if response.data and len(response.data) > 0:
            return {
                "status": "Success",
                "profile": response.data[0]
            }
        return {"status": "Error", "message": "User profile not found in database."}

    except Exception as e:
        return {"status": "Error", "message": str(e)}


# Protected route example
@app.get("/api/dashboard", dependencies=[Depends(verify_jwt)])
def get_dashboard_data():
    return {
        "status": "Success",
        "data": "This route is protected."
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)