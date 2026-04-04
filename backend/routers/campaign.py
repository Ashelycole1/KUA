from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel
from typing import Optional

from services import gemini_service, docai_service, storage_service
from db import supabase_client
from services.auth_deps import get_current_user

router = APIRouter(prefix="", tags=["campaign"])


class CampaignRequest(BaseModel):
    text: Optional[str] = None
    phone: Optional[str] = None
    biz_name: Optional[str] = ""
    biz_type: Optional[str] = ""
    brand_keywords: Optional[str] = ""
    tone: Optional[str] = "warm"
    language: Optional[str] = "en"


class CampaignResponse(BaseModel):
    whatsapp: str
    social: str
    ambassador: str
    flyer_url: Optional[str] = None
    credits_remaining: Optional[int] = None


@router.post("/generate-campaign", response_model=CampaignResponse)
async def generate_campaign(req: CampaignRequest, decoded: dict = Depends(get_current_user)):
    """
    Generate campaign. 
    Verifies authenticated user and checks credits.
    """
    # ── Verify phone ownership ──
    # Since we authenticated via Clerk, we can trust the decoded identity.
    clerk_id = decoded.get("sub")
    user = supabase_client.get_user_by_clerk_id(clerk_id)
    if not user:
         raise HTTPException(status_code=401, detail="User profile not initialized. Please call /auth/login first.")
    
    phone = user["phone_number"]
    
    # ── Credit check (with self-healing for demo) ──
    if user["credit_balance"] <= 0:
        # Auto-grant 100 trial credits if they are out
        supabase_client.add_credits(phone, 100)
        user["credit_balance"] = 100
    
    input_text = req.text or "General product promotion"

    # ── Gemini generates 4 tone variants ──
    variants = await gemini_service.generate_campaign_text(
        text=input_text,
        biz_name=req.biz_name or "",
        biz_type=req.biz_type or "",
        brand_keywords=req.brand_keywords or "",
    )

    # ── Deduct 1 credit on success ──
    supabase_client.deduct_credit(phone)
    user = supabase_client.get_user(phone)
    credits_remaining = user["credit_balance"] if user else None

    # ── Imagen Generation & Upload ──
    flyer_bytes = await gemini_service.generate_flyer(input_text)
    flyer_url = None
    if flyer_bytes:
        flyer_url = storage_service.upload_flyer(flyer_bytes, phone)

    # ── Store in History ──
    supabase_client.save_campaign(
        phone=phone,
        prompt=input_text,
        variants=variants,
        tone_selected=req.tone or "warm",
        flyer_url=flyer_url or ""
    )

    t = (req.tone or "warm").lower()
    if t == "urgent":
        mapped_social = variants.get("hype", "")
    elif t == "local":
        mapped_social = variants.get("sheng", "")
    else:
        mapped_social = variants.get("professional", "")

    return CampaignResponse(
        whatsapp=variants.get("sms", ""),
        social=mapped_social,
        ambassador=variants.get("ambassador_message", ""),
        flyer_url=flyer_url,
        credits_remaining=credits_remaining,
    )


@router.get("/campaign-history", response_model=list[dict])
async def get_history(decoded: dict = Depends(get_current_user)):
    """Retrieve private campaign history for the authenticated user."""
    clerk_id = decoded.get("sub")
    user = supabase_client.get_user_by_clerk_id(clerk_id)
    if not user:
        return []
        
    history = supabase_client.get_campaign_history(user["phone_number"])
    return history


@router.post("/generate-campaign/image", response_model=CampaignResponse)
async def generate_campaign_image(
    file: UploadFile = File(...),
    phone: str = Form(""),
    biz_name: str = Form(""),
    brand_keywords: str = Form(""),
    decoded: dict = Depends(get_current_user)
):
    """Authenticated image-to-campaign generation."""
    clerk_id = decoded.get("sub")
    user = supabase_client.get_user_by_clerk_id(clerk_id)
    if not user or user["phone_number"] != phone:
         raise HTTPException(status_code=403, detail="Phone verification check failed.")

    if user["credit_balance"] <= 0:
        raise HTTPException(status_code=403, detail="Insufficient credits.")

    image_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"

    # ── Try Document AI first, fall back to Gemini vision ──
    extracted_text = await docai_service.ocr_image(image_bytes, mime_type)
    if not extracted_text.strip():
        extracted_text = await gemini_service.generate_campaign_from_image(image_bytes, mime_type)

    # ── Generate variants from extracted text ──
    variants = await gemini_service.generate_campaign_text(
        text=extracted_text,
        biz_name=biz_name,
        brand_keywords=brand_keywords,
    )

    supabase_client.deduct_credit(phone)
    supabase_client.save_campaign(
        phone=phone,
        prompt=extracted_text,
        variants=variants,
        tone_selected="warm",
        flyer_url=""
    )

    return CampaignResponse(
        whatsapp=variants.get("sms", ""),
        social=variants.get("professional", ""),
        ambassador=variants.get("ambassador_message", ""),
    )
