import os
import uuid as uuid_lib
from datetime import date, datetime
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
from supabase import create_client, Client

current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_dir, ".env")
load_dotenv(dotenv_path)

URL: str = os.environ.get("SUPABASE_URL")
KEY: str = os.environ.get("SUPABASE_KEY")
SERVICE_ROLE_KEY: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not URL or not KEY:
    raise ValueError(f"Environment variables missing! Checked path: {dotenv_path}. Found URL: {URL}, KEY: {KEY}")
if not SERVICE_ROLE_KEY:
    raise ValueError(
        f"SUPABASE_SERVICE_ROLE_KEY missing! Checked path: {dotenv_path}. "
        "Get it from Supabase Project Settings -> API -> service_role secret, "
        "and add it to Backend/.env."
    )


supabase: Client = create_client(URL, KEY)

supabase_admin: Client = create_client(URL, SERVICE_ROLE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from security import verify_jwt, RoleChecker

allow_admin = RoleChecker(["admin"])
allow_teacher = RoleChecker(["teacher", "admin"])
allow_student = RoleChecker(["student", "admin"])


class LoginData(BaseModel):
    email: str
    password: str


class RegisterData(BaseModel):
    email: str
    password: str
    full_name: str

# change password
class ChangePasswordData(BaseModel):
    new_password: str


class InviteTeacherData(BaseModel):
    email: str


class InviteStudentData(BaseModel):
    email: str


class UserRoleData(BaseModel):
    new_role: str


class CreateModuleData(BaseModel):
    name: str
    code: str
    description: str = ""
    teacher_id: str = None


class ForgotPasswordData(BaseModel):
    email: str

from typing import Optional

class ChatData(BaseModel):
    message: str
    role: Optional[str] = None




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


@app.post("/auth/register")
def register(user_data: RegisterData):
    try:
        # wrapping the role inside  options.data
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "role": "student"
                }
            }
        })
    except Exception as e:
        error_message = str(e)
        if "already registered" in error_message.lower() or "already exists" in error_message.lower():
            return {"status": "Error", "message": "Validation Failed: This email is already registered."}
        else:
            return {"status": "Error", "message": error_message}

    new_user_id = response.user.id

    try:

        supabase_admin.schema("ai_student").table("users").insert({
            "id": new_user_id,
            "name": user_data.full_name,
            "role": "student",
            "email": user_data.email,
            "date_created": date.today().isoformat()
        }).execute()

        supabase_admin.schema("ai_student").table("profile").insert({
            "id": new_user_id,
            "user_id": new_user_id,
            "role": "student",
            "semester": None,
            "module_study": None,
            "modules_teach": None
        }).execute()

    except Exception as e:
        return {
            "status": "Error",
            "message": (
                f"Auth account created but profile setup failed: {str(e)}. "
                "This account is orphaned — contact an admin to fix it manually."
            )
        }

    return {"status": "Success", "message": "User registered successfully!"}


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


@app.post("/auth/change-password")
def change_password(
        password_data: ChangePasswordData,
        current_user=Depends(verify_jwt)  # extracts user ID from the valid token
):
    try:
        # admin client to  force the password update for this specific ID
        response = supabase_admin.auth.admin.update_user_by_id(
            current_user.id,
            {"password": password_data.new_password}
        )

        return {"status": "Success", "message": "Password updated successfully!"}

    except Exception as e:
        return {"status": "Error", "message": f"Failed to update password: {str(e)}"}


@app.post("/auth/forgot-password")
def forgot_password(forgot_data: ForgotPasswordData):
    try:
        # trigger password reset email from supabase
        supabase.auth.reset_password_for_email(
            forgot_data.email,
            options={
                "redirect_to": "http://localhost:5173/#recovery"
            }
        )
        return {"status": "Success", "message": "Password reset email sent successfully!"}
    except Exception as e:
        return {"status": "Error", "message": f"Failed to send reset email: {str(e)}"}


@app.get("/api/me")
def get_current_user(current_user=Depends(verify_jwt)):
    # fetch secure role and name values from db
    # NOTE: must use supabase_admin — the anon client is blocked by RLS and
    # returns zero rows, which silently defaults every user to "student".
    role = "student"
    name = None
    try:
        res = supabase_admin.schema("ai_student").table("users").select("role, name").eq("id", current_user.id).execute()
        if res.data and len(res.data) > 0:
            role = res.data[0].get("role", "student")
            name = res.data[0].get("name")
    except Exception as e:
        print(f"Error fetching secure user data: {e}")


    safe_user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "role": role,
        "name": name,
        "created_at": current_user.created_at,
        "last_sign_in_at": current_user.last_sign_in_at
    }

    return {
        "status": "Success",
        "user": safe_user_data
    }

@app.get("/api/users/{user_id}", dependencies=[Depends(verify_jwt)])
def lookup_user_profile(user_id: str):
    try:
        response = supabase_admin.schema("ai_student").table("profile").select("*").eq("id", user_id).execute()

        if response.data and len(response.data) > 0:
            return {
                "status": "Success",
                "profile": response.data[0]
            }
        return {"status": "Error", "message": "User profile not found in database."}

    except Exception as e:
        return {"status": "Error", "message": str(e)}


@app.get("/admin/users", dependencies=[Depends(allow_admin)])
def list_all_users():
    try:
        res = supabase_admin.schema("ai_student").table("users") \
            .select("id, name, email, role, date_created") \
            .order("date_created", desc=True) \
            .execute()
        return {
            "status": "Success",
            "users": res.data if res.data else []
        }
    except Exception as e:
        return {"status": "Error", "message": str(e)}


@app.put("/admin/users/{user_id}/role", dependencies=[Depends(allow_admin)])
def change_user_role(user_id: str, role_data: UserRoleData):
    allowed_roles = ["student", "teacher", "admin"]
    new_role = role_data.new_role.strip().lower()
    if new_role not in allowed_roles:
        return {"status": "Error", "message": f"Invalid role '{role_data.new_role}'. Allowed roles are: {allowed_roles}"}
    try:
        users_res = supabase_admin.schema("ai_student").table("users") \
            .update({"role": new_role}) \
            .eq("id", user_id) \
            .execute()

        if not users_res.data:
            return {"status": "Error", "message": f"User with ID {user_id} not found."}

        supabase_admin.schema("ai_student").table("profile") \
            .update({"role": new_role}) \
            .eq("id", user_id) \
            .execute()

        try:
            supabase_admin.auth.admin.update_user_by_id(user_id, {"user_metadata": {"role": new_role}})
        except Exception:
            pass

        return {
            "status": "Success",
            "message": f"User role updated to '{new_role}' successfully."
        }
    except Exception as e:
        return {"status": "Error", "message": str(e)}


@app.get("/api/dashboard/admin", dependencies=[Depends(allow_admin)])
def get_admin_dashboard(current_user = Depends(verify_jwt)):
    try:
        # fetch all users to count teachers and students securely
        users_res = supabase_admin.schema("ai_student").table("users").select("role").execute()
        teachers_count = sum(1 for u in users_res.data if u.get("role") == "teacher")
        students_count = sum(1 for u in users_res.data if u.get("role") == "student")

        # fetch all profiles to compile unique modules list
        profiles_res = supabase_admin.schema("ai_student").table("profile").select("module_study, modules_teach").execute()
        modules_set = set()
        for row in profiles_res.data:
            study = row.get("module_study")
            if study:
                for m in study.split(","):
                    m_clean = m.strip()
                    if m_clean:
                        modules_set.add(m_clean)
            teach = row.get("modules_teach")
            if teach:
                for m in teach.split(","):
                    m_clean = m.strip()
                    if m_clean:
                        modules_set.add(m_clean)
        modules_count = len(modules_set)

        return {
            "status": "Success",
            "dashboard_type": "Admin",
            "data": {
                "message": "Welcome to the Admin Control Panel.",
                "user_email": current_user.email,
                "teachers_count": teachers_count,
                "students_count": students_count,
                "modules_count": modules_count
            }
        }
    except Exception as e:
        return {"status": "Error", "message": str(e)}


@app.post("/api/modules", dependencies=[Depends(allow_admin)])
def create_module(module_data: CreateModuleData):
    name = module_data.name.strip()
    code = module_data.code.strip().upper()
    description = module_data.description.strip() if module_data.description else ""

    if not name or not code:
        return {"status": "Error", "message": "Module 'name' and 'code' cannot be empty."}

    try:
        # Check if code already exists
        existing = supabase_admin.schema("ai_student").table("modules").select("id").eq("code", code).execute()
        if existing.data:
            return {"status": "Error", "message": f"Module with code '{code}' already exists."}

        # If teacher_id is provided, verify assigned user exists and is a teacher
        assigned_teacher_id = module_data.teacher_id
        if assigned_teacher_id:
            t_res = supabase_admin.schema("ai_student").table("users") \
                .select("id, role").eq("id", assigned_teacher_id).execute()
            if not t_res.data:
                return {"status": "Error", "message": f"Assigned teacher with ID '{assigned_teacher_id}' not found."}
            if t_res.data[0].get("role") != "teacher":
                return {"status": "Error", "message": f"User '{assigned_teacher_id}' is not a teacher (role: '{t_res.data[0].get('role')}')."}

        # Insert module record
        new_module_id = str(uuid_lib.uuid4())
        res = supabase_admin.schema("ai_student").table("modules").insert({
            "id": new_module_id,
            "name": name,
            "code": code,
            "description": description,
            "teacher_id": assigned_teacher_id,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }).execute()

        return {
            "status": "Success",
            "message": f"Module '{name}' ({code}) created successfully!",
            "module": res.data[0] if res.data else None
        }
    except Exception as e:
        return {"status": "Error", "message": str(e)}


@app.post("/admin/create-teacher", dependencies=[Depends(allow_admin)])
def invite_teacher(invite_data: InviteTeacherData):
    try:
        # send invite via supabase admin auth
        response = supabase_admin.auth.admin.invite_user_by_email(
            invite_data.email,
            options={
                "data": {
                    "role": "teacher"
                }
            }
        )
    except Exception as e:
        error_message = str(e)
        if "already registered" in error_message.lower() or "already exists" in error_message.lower():
            return {"status": "Error", "message": "This email is already registered."}
        return {"status": "Error", "message": f"Invitation failed: {error_message}"}

    new_user_id = response.user.id

    try:
        # sync auth user to db users and profile tables
        supabase_admin.schema("ai_student").table("users").insert({
            "id": new_user_id,
            "name": invite_data.email.split("@")[0],
            "role": "teacher",
            "email": invite_data.email,
            "date_created": date.today().isoformat()
        }).execute()

        supabase_admin.schema("ai_student").table("profile").insert({
            "id": new_user_id,
            "user_id": new_user_id,
            "role": "teacher",
            "semester": None,
            "module_study": None,
            "modules_teach": None
        }).execute()

    except Exception as e:
        return {
            "status": "Error",
            "message": (
                f"Invitation sent but profile setup failed: {str(e)}. "
                "Contact an admin to resolve this orphaned record."
            )
        }

    return {"status": "Success", "message": "Teacher invited successfully!"}


@app.post("/admin/create-student", dependencies=[Depends(allow_admin)])
def invite_student(invite_data: InviteStudentData):
    try:
        # send invite via supabase admin auth
        response = supabase_admin.auth.admin.invite_user_by_email(
            invite_data.email,
            options={
                "data": {
                    "role": "student"
                }
            }
        )
    except Exception as e:
        error_message = str(e)
        if "already registered" in error_message.lower() or "already exists" in error_message.lower():
            return {"status": "Error", "message": "This email is already registered."}
        return {"status": "Error", "message": f"Invitation failed: {error_message}"}

    new_user_id = response.user.id

    try:
        # sync auth user to db users and profile tables
        supabase_admin.schema("ai_student").table("users").insert({
            "id": new_user_id,
            "name": invite_data.email.split("@")[0],
            "role": "student",
            "email": invite_data.email,
            "date_created": date.today().isoformat()
        }).execute()

        supabase_admin.schema("ai_student").table("profile").insert({
            "id": new_user_id,
            "user_id": new_user_id,
            "role": "student",
            "semester": None,
            "module_study": None,
            "modules_teach": None
        }).execute()

    except Exception as e:
        return {
            "status": "Error",
            "message": (
                f"Invitation sent but profile setup failed: {str(e)}. "
                "Contact an admin to resolve this orphaned record."
            )
        }

    return {"status": "Success", "message": "Student invited successfully!"}


@app.get("/api/dashboard/teacher", dependencies=[Depends(allow_teacher)])
def get_teacher_dashboard(current_user = Depends(verify_jwt)):
    try:
        # Fetch real modules assigned to this teacher from the modules table
        modules_res = supabase_admin.schema("ai_student").table("modules") \
            .select("id, name, code, description, created_at") \
            .eq("teacher_id", current_user.id) \
            .order("created_at", desc=True) \
            .execute()

        modules_list = modules_res.data if modules_res.data else []
        teacher_module_codes = [m["code"] for m in modules_list]

        # fetch all student users and profiles to match enrollments
        students_res = supabase_admin.schema("ai_student").table("users").select("id, name, email").eq("role", "student").execute()
        student_users = {s["id"]: s for s in students_res.data}

        profiles_res = supabase_admin.schema("ai_student").table("profile").select("id, module_study").eq("role", "student").execute()

        students_list = []
        for p in profiles_res.data:
            s_id = p["id"]
            if s_id in student_users:
                study_str = p.get("module_study")
                if study_str:
                    student_mods = [m.strip().upper() for m in study_str.split(",") if m.strip()]
                    shared_mods = [m for m in student_mods if m in teacher_module_codes or m in [mod["name"].upper() for mod in modules_list]]
                    if shared_mods:
                        students_list.append({
                            "name": student_users[s_id]["name"],
                            "email": student_users[s_id]["email"],
                            "enrolled_modules": shared_mods
                        })

        return {
            "status": "Success",
            "dashboard_type": "Teacher",
            "data": {
                "message": "Welcome to the Teacher Portal.",
                "modules_count": len(modules_list),
                "modules": modules_list,
                "students": students_list
            }
        }
    except Exception as e:
        return {"status": "Error", "message": str(e)}


@app.get("/api/dashboard/student", dependencies=[Depends(allow_student)])
def get_student_dashboard(current_user = Depends(verify_jwt)):
    try:

        profile_response = supabase_admin.schema("ai_student").table("profile").select("semester, module_study").eq("id", current_user.id).execute()
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

def generate_ai_response(role: str, message: str, user_name: str) -> str:
    role_intro = {
        "admin": f"Hi {user_name}, as an admin assistant I can help with staff, "
                 f"enrollment, and institution-wide questions.",
        "teacher": f"Hi {user_name}, as your teaching assistant I can help you plan "
                   f"lessons, summarize modules, or draft messages to students.",
        "student": f"Hi {user_name}, as your AI tutor I can help explain concepts, "
                   f"quiz you, or help you study.",
    }.get(role, f"Hi {user_name}, how can I help?")

    return f"{role_intro}\n\nYou asked: \"{message}\"\n\n(This is a placeholder reply — connect a real LLM here.)"


@app.post("/api/chat")
def chat(chat_data: ChatData, current_user=Depends(verify_jwt)):
    try:
        role = "student"
        name = current_user.email
        res = supabase_admin.schema("ai_student").table("users").select("role, name").eq("id", current_user.id).execute()
        if res.data and len(res.data) > 0:
            role = res.data[0].get("role", "student")
            name = res.data[0].get("name") or name

        reply = generate_ai_response(role, chat_data.message, name)

        return {"status": "Success", "reply": reply, "role": role}
    except Exception as e:
        return {"status": "Error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)