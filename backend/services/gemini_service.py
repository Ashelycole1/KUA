import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

MODEL = "gemini-2.5-flash-preview-04-17"

SYSTEM_PROMPT = """You are a marketing copywriter for Kenyan small businesses.
Generate campaign copy that feels authentic, local, and compelling.
Always write in a way that resonates with Kenyan customers.
For Sheng/Local tone, use common Kenyan slang naturally (e.g. wadau, bei poa, piga simu).
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
    model = genai.GenerativeModel(MODEL, system_instruction=SYSTEM_PROMPT)

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
        raw = response.text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        import json
        return json.loads(raw.strip())
    except Exception as e:
        # Graceful fallback
        return {
            "professional": f"We are pleased to offer {text}. Contact us today for orders.",
            "hype": f"🔥 {text.upper()}!! Don't miss out — limited stock! Call NOW!",
            "sheng": f"Wadau! {text}. Bei poa sana! Piga simu haraka kabla haijaisha!",
            "sms": f"{text[:120]}. Call now!",
        }


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
