import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
from supabase import create_client, Client

# --- Force Python to find the .env file next to main.py ---
current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_dir, ".env")
load_dotenv(dotenv_path)

URL: str = os.environ.get("SUPABASE_URL")
KEY: str = os.environ.get("SUPABASE_KEY")

# Safety validation check before client initialization
if not URL or not KEY:
    raise ValueError(f"Environment variables missing! Checked path: {dotenv_path}. Found URL: {URL}, KEY: {KEY}")

supabase: Client = create_client(URL, KEY)

app = FastAPI()

# --- CORS Configuration to allow React frontend ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Import Security Dependencies ---
from security import verify_jwt, RoleChecker

# 1. Instantiate the Security Guards
# Admins can access everything. Teachers and Students are strictly separated.
allow_admin = RoleChecker(["admin"])
allow_teacher = RoleChecker(["teacher", "admin"])
allow_student = RoleChecker(["student", "admin"])


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
# REQUIREMENT: Test duplicate email validation & Registration
# =========================================================================
@app.post("/auth/register")
def register(user_data: LoginData):
    try:
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "role": "student",
        })
        return {"status": "Success", "message": "User registered successfully!"}

    except Exception as e:
        error_message = str(e)
        # Explicit validation catching for duplicate keys/emails
        if "already registered" in error_message.lower() or "already exists" in error_message.lower():
            return {"status": "Error", "message": "Validation Failed: This email is already registered."}
        else:
            return {"status": "Error", "message": error_message}


# =========================================================================
# REQUIREMENT: Create login query
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
        print(f"DEBUG - Real Supabase Error: {str(e)}")
        return {"status": "Error", "message": "Wrong email or password"}


@app.post("/logout")
def logout():
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully."}
    except Exception as e:
        return {"status": "Error", "message": str(e)}


# get me api
@app.get("/api/me")
def get_current_user(current_user=Depends(verify_jwt)):
    safe_user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.user_metadata.get("role", "student"),
        "created_at": current_user.created_at,
        "last_sign_in_at": current_user.last_sign_in_at
    }

    return {
        "status": "Success",
        "user": safe_user_data
    }


# =========================================================================
# REQUIREMENT: Create user lookup query
# =========================================================================
@app.get("/api/users/{user_id}", dependencies=[Depends(verify_jwt)])
def lookup_user_profile(user_id: str):
    try:
        response = supabase.schema("ai_student").table("profile").select("*").eq("id", user_id).execute()

        if response.data and len(response.data) > 0:
            return {
                "status": "Success",
                "profile": response.data[0]
            }
        return {"status": "Error", "message": "User profile not found in database."}

    except Exception as e:
        return {"status": "Error", "message": str(e)}


# dashboard validation
@app.get("/api/dashboard/admin", dependencies=[Depends(allow_admin)])
def get_admin_dashboard(current_user = Depends(verify_jwt)):

    try:
        return {
            "status": "Success",
            "dashboard_type": "Admin",
            "data": {
                "message": "Welcome to the Admin Control Panel.",
                "user_email": current_user.email
            }
        }
    except Exception as e:
        return {"status": "Error", "message": str(e)}

# teacher dashboard
@app.get("/api/dashboard/teacher", dependencies=[Depends(allow_teacher)])
def get_teacher_dashboard(current_user = Depends(verify_jwt)):
    try:

        profile_response = supabase.schema("ai_student").table("profile").select("modules_teach").eq("id", current_user.id).execute()
        teacher_data = profile_response.data[0] if profile_response.data else {}

        return {
            "status": "Success",
            "dashboard_type": "Teacher",
            "data": {
                "message": "Welcome to the Teacher Portal.",
                "teaching_modules": teacher_data.get("modules_teach", "None assigned")
            }
        }
    except Exception as e:
        return {"status": "Error", "message": str(e)}

# student dashboard
@app.get("/api/dashboard/student", dependencies=[Depends(allow_student)])
def get_student_dashboard(current_user = Depends(verify_jwt)):

    try:
        #student data
        profile_response = supabase.schema("ai_student").table("profile").select("semester, module_study").eq("id", current_user.id).execute()
        student_data = profile_response.data[0] if profile_response.data else {}

        return {
            "status": "Success",
            "dashboard_type": "Student",
            "data": {
                "message": "Welcome to the Student Dashboard.",
                "semester": student_data.get("semester", "Not specified"),
                "studying_modules": student_data.get("module_study", "None assigned")
            }
        }
    except Exception as e:
        return {"status": "Error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)