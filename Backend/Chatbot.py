import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai

# Load Backend/.env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

api_key = os.getenv("GEMINI_API_KEY", "").strip()

if not api_key:
    raise ValueError(
        f"GEMINI_API_KEY was not found in:\n{env_path}"
    )

client = genai.Client(api_key=api_key)

chat = client.chats.create(model="gemini-2.5-flash")
try:
    # First test whether the key works
    test_response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Reply only with: Connection successful",
    )

    print("Gemini:", test_response.text)
    print("\n==================================================")
    print(" Gemini Chat Bot is ready! Type 'exit' to quit.")
    print("==================================================\n")

    chat = client.chats.create(model="gemini-2.5-flash")

    while True:
        user_message = input("You: ").strip()

        if user_message.lower() == "exit":
            print("Goodbye!")
            break

        if not user_message:
            continue

        try:
            response = chat.send_message(user_message)
            print(f"Gemini: {response.text}\n")

        except Exception as error:
            print(f"Message error: {error}\n")
            #

except Exception as error:
    print("\nGemini connection failed:")
    print(error)