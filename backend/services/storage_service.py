import os
import io
from PIL import Image
from supabase import create_client, Client
from datetime import datetime

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
BUCKET = "kua-flyers"

def get_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def compress_to_webp(image_bytes: bytes, max_kb: int = 50) -> bytes:
    """Compress image to WebP under max_kb kilobytes."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    # Resize to max 1024px square
    img.thumbnail((1024, 1024), Image.LANCZOS)

    quality = 85
    while quality >= 20:
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=quality, method=6)
        if buf.tell() <= max_kb * 1024:
            return buf.getvalue()
        quality -= 10

    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=20)
    return buf.getvalue()


def upload_flyer(image_bytes: bytes, phone: str) -> str:
    """Compress and upload flyer to Supabase Storage. Returns public CDN URL."""
    try:
        compressed = compress_to_webp(image_bytes)
        ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        filename = f"flyers/{phone or 'anon'}_{ts}.webp"
        client = get_client()
        client.storage.from_(BUCKET).upload(
            filename,
            compressed,
            {"content-type": "image/webp"},
        )
        url = client.storage.from_(BUCKET).get_public_url(filename)
        return url
    except Exception as e:
        return ""  # Graceful fallback — frontend shows placeholder
