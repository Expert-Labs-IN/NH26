from app.config.gemini import client
import json

async def process_voice_text(text: str):

    prompt = f"""
    You are an AI assistant.

    Convert the user voice command into structured JSON.

    Command:
    "{text}"

    Return ONLY valid JSON.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        print("RAW RESPONSE:", response)  # 👈 DEBUG
        print("TEXT:", response.text)     # 👈 DEBUG

        text_response = response.text.strip()

        if text_response.startswith("```"):
            text_response = text_response.replace("```json", "").replace("```", "").strip()

        return json.loads(text_response)

    except Exception as e:
        print("ERROR:", str(e))  # 👈 IMPORTANT

        return {
            "error": str(e)
        }