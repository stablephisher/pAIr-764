import google.generativeai as genai
import os

api_key = "AIzaSyCrraMw4LcmQOnX_EJj5Yjg29jLvSt7IoU"
genai.configure(api_key=api_key)

print("Writing models to models_clean.txt...")
with open("models_clean.txt", "w", encoding="utf-8") as f:
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(m.name + "\n")
        print("Done.")
    except Exception as e:
        f.write(f"Error: {e}\n")
        print(f"Error: {e}")
