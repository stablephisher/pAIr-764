import google.generativeai as genai
import os
import time

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # Fallback for testing if env var isn't picked up in this session
    api_key = "AIzaSyCrraMw4LcmQOnX_EJj5Yjg29jLvSt7IoU"

genai.configure(api_key=api_key)

models = ["models/gemini-2.5-flash", "models/gemini-2.0-flash-exp"]

for m in models:
    print(f"Testing {m}...")
    try:
        start = time.time()
        model = genai.GenerativeModel(m)
        response = model.generate_content("Hello, provide a simple JSON: {'status': 'ok'}", generation_config={"response_mime_type": "application/json"})
        duration = time.time() - start
        print(f"Success! Time: {duration:.2f}s")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Failed: {e}")
    print("-" * 20)
