# app/config/gemini.py

from google import genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)