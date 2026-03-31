import os
import base64
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))

MODEL = "gemini-2.5-flash"
IMAGEN_MODEL = "imagen-3.0-generate-001"

SYSTEM_PROMPT = """You are a pan-African marketing copywriter for small mobile-first merchants.
Generate campaign copy that feels authentic, local, and compelling for the merchant's target audience.
For the local/street tone (key: sheng), flexibly adapt your syntax and slang to match the merchant's location/Business DNA organically (e.g. Sheng in Kenya, Pidgin in Nigeria or Ghana, local vernacular elsewhere).
Keep SMS under 160 characters.
Return ONLY a valid JSON object with keys: professional, hype, sheng, sms.
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

Generate 4 campaign variations as JSON:
- professional: formal, trust-building tone
- hype: exciting, urgent, emoji-friendly
- sheng: Kenyan local slang, warm and relatable
- sms: under 160 chars, direct call-to-action"""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
            ),
        )
        import json
        return json.loads(response.text.strip())
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "professional": f"We are pleased to offer {text}. Contact us today for orders.",
            "hype": f"🔥 {text.upper()}!! Don't miss out — limited stock! Call NOW!",
            "sheng": f"Good news! {text}. Top quality, great prices! Hurry while stocks last!",
            "sms": f"{text[:120]}. Call now!",
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
