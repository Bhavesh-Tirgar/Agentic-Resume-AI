import os
import urllib.request
import urllib.error
import json
from dotenv import load_dotenv

load_dotenv("ResumeAI/.env")
api_key = os.getenv("GEMINI_API_KEY")

url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + api_key

print("Testing API Key with URL:", url[:65] + "...")

try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        models = data.get("models", [])
        print(f"SUCCESS! Connected to Google Gemini API. Found {len(models)} models.")
        for m in models[:5]:
            print(" -", m.get("name"))
except urllib.error.HTTPError as e:
    print(f"HTTPError {e.code}:")
    print(e.read().decode())
except Exception as e:
    print(f"Exception: {e}")
