import os
import base64
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", "mock_key_to_prevent_crash"))

MODEL = "gemini-2.5-flash"
IMAGEN_MODEL = "imagen-3.0-generate-001"

SYSTEM_PROMPT = """You are a pan-African marketing copywriter for small mobile-first merchants.
Generate campaign copy that feels authentic, local, and compelling for the merchant's target audience.
Return ONLY a valid JSON object with specific keys for different channels and tones:
- professional: A formal, professional message for mature social media or business context.
- hype: Call-to-action focused urgent deal message.
- sheng: Localized Slang/Sheng variation highly relatable to urban youth and community.
- sms: High-conversion direct message for WhatsApp/SMS (Keep under 160 chars if possible).
- ambassador_message: A warm, personalized message for a friend (Ambassador) to forward.
No markdown, no extra text — just the JSON."""


async def generate_campaign_text(
    text: str,
    biz_name: str = "",
    biz_type: str = "",
    brand_keywords: str = "",
) -> dict:
    """Call Gemini 2.5 Flash and return 4 campaign tone variants."""

    context = ""
    if biz_name:
        context += f"Business: {biz_name}\n"
    if biz_type:
        context += f"Type: {biz_type}\n"
    if brand_keywords:
        context += f"Brand keywords: {brand_keywords}\n"

    prompt = f"""{context}
Product/Offer: {text}

Generate 5 campaign variations as JSON:
- professional: Formal & professional tone.
- hype: Urgent, flash-sale tone.
- sheng: Local street/sheng variation.
- sms: Direct chat/SMS format.
- ambassador_message: Friendly forwardable message."""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                http_options={"timeout": 20},
            ),
        )
        import json
        return json.loads(response.text.strip())
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "professional": f"Dear valued customer, {text.capitalize()} is now available. Visit us to purchase.",
            "hype": f"🔥🔥 FLASH DEAL!! {text.upper()} grabbing fast! Limited stock! 📉",
            "sheng": f"Eish fam! Ile {text} imeland. Piga tizi ukuje ucheki 👊",
            "sms": f"Hey fam! Fresh stock of {text} arrived. WhatsApp order now! 📉",
            "ambassador_message": f"Guys! My friend at the shop has a crazy deal on {text}. Check it out here: kua.link/amb-thandi 🔥",
        }


async def generate_flyer(prompt: str) -> bytes | None:
    """Trigger Google Imagen 3 to generate a 1024x1024 marketing asset."""
    try:
        response = client.models.generate_images(
            model=IMAGEN_MODEL,
            prompt=f"A highly aesthetic, professional promotional flyer for a local African business: {prompt}",
            config=types.GenerateImageConfig(
                number_of_images=1,
                output_mime_type="image/jpeg",
                aspect_ratio="1:1",
            ),
        )
        if response.generated_images:
            return response.generated_images[0].image.image_bytes
        return None
    except Exception as e:
        print(f"Imagen Error: {e}")
        return None


async def generate_campaign_from_image(image_bytes: bytes, mime_type: str) -> str:
    """Use Gemini vision to extract product info from an image."""
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                "This is a photo from a Kenyan market vendor. "
                "Extract: product name, price if visible, and any phone numbers. "
                "Return a single descriptive sentence suitable for a marketing campaign.",
            ],
        )
        return response.text.strip()
    except Exception as e:
        print(f"Vision Error: {e}")
        return ""
