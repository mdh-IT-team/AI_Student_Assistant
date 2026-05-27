import os
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

URL: str = os.environ.get("SUPABASE_URL")
KEY: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(URL, KEY)

app = FastAPI()


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
        if "already registered" in error_message.lower() or "already exists" in error_message.lower():
            return {"status": "Error", "message": "This email is already registered."}
        else:
            return {"status": "Error", "message": error_message}

# --- AQUI ESTA EL CAMBIO PARA EL JIRA ---
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
        return {"message": "Logged out successfully. The frontend must delete the token."}
    except Exception as e:
        return {"status": "Error", "message": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)