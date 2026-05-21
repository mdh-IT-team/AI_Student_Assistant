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


@app.get("/")
def check_status():
    return {"message": "The AI Student Assistant server is running and connected to Supabase!"}


@app.post("/login")
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