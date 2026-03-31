import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

MODEL = "gemini-2.5-flash"

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
    model = genai.GenerativeModel(
        MODEL,
        system_instruction=SYSTEM_PROMPT,
        generation_config={"response_mime_type": "application/json"}
    )

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
        response = model.generate_content(prompt)
        import json
        return json.loads(response.text.strip())
    except Exception as e:
        # Graceful fallback
        print(f"Gemini API Error: {e}")
        return {
            "professional": f"We are pleased to offer {text}. Contact us today for orders.",
            "hype": f"🔥 {text.upper()}!! Don't miss out — limited stock! Call NOW!",
            "sheng": f"Good news! {text}. Top quality, great prices! Hurry while stocks last!",
            "sms": f"{text[:120]}. Call now!",
        }


async def generate_flyer(prompt: str) -> bytes | None:
    """Trigger Google Imagen to generate a 1024x1024 marketing asset."""
    try:
        # Note: Depending on the SDK structure, adjust the model name (e.g., imagen-3.0-generate-001)
        # We rely on the raw REST endpoint or SDK wrapper if present.
        url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key={os.getenv('GEMINI_API_KEY', '')}"
        
        # We fall back to standard HTTP call instead of raw google-generativeai SDK to guarantee it works without version crashes.
        import requests
        headers = {"Content-Type": "application/json"}
        payload = {
            "instances": [{"prompt": f"A highly aesthetic, professional promotional flyer for a local African business: {prompt}"}],
            "parameters": {"sampleCount": 1, "aspectRatio": "1:1"}
        }
        res = requests.post(url, headers=headers, json=payload)
        res.raise_for_status()
        
        data = res.json()
        if "predictions" in data and len(data["predictions"]) > 0:
            import base64
            img_b64 = data["predictions"][0].get("bytesBase64Encoded", "")
            if img_b64:
                return base64.b64decode(img_b64)
        return None
    except Exception as e:
        print(f"Imagen Error: {e}")
        return None


async def generate_campaign_from_image(image_bytes: bytes, mime_type: str) -> str:
    """Use Gemini vision to extract product info from an image."""
    model = genai.GenerativeModel(MODEL)
    import google.generativeai as genai_img

    image_part = {"mime_type": mime_type, "data": image_bytes}
    prompt = (
        "This is a photo from a Kenyan market vendor. "
        "Extract: product name, price if visible, and any phone numbers. "
        "Return a single descriptive sentence suitable for a marketing campaign."
    )
    response = model.generate_content([prompt, image_part])
    return response.text.strip()
