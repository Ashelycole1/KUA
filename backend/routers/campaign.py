from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional

from services import gemini_service, docai_service, storage_service
from db import supabase_client

router = APIRouter(prefix="", tags=["campaign"])


class CampaignRequest(BaseModel):
    text: Optional[str] = None
    phone: Optional[str] = None
    biz_name: Optional[str] = ""
    biz_type: Optional[str] = ""
    brand_keywords: Optional[str] = ""


class CampaignResponse(BaseModel):
    professional: str
    hype: str
    sheng: str
    sms: str
    flyer_url: Optional[str] = None
    credits_remaining: Optional[int] = None


@router.post("/generate-campaign", response_model=CampaignResponse)
async def generate_campaign(req: CampaignRequest):
    phone = req.phone or ""

    # ── Credit check ──
    if phone:
        user = supabase_client.get_user(phone)
        if user and user["credit_balance"] <= 0:
            raise HTTPException(status_code=403, detail="Insufficient credits. Please top up your wallet via the gateway.")
    
    input_text = req.text or "General product promotion"

    # ── Gemini generates 4 tone variants ──
    variants = await gemini_service.generate_campaign_text(
        text=input_text,
        biz_name=req.biz_name or "",
        biz_type=req.biz_type or "",
        brand_keywords=req.brand_keywords or "",
    )

    # ── Deduct 1 credit on success ──
    credits_remaining = None
    if phone:
        supabase_client.deduct_credit(phone)
        user = supabase_client.get_user(phone)
        if user:
            credits_remaining = user["credit_balance"]

    # ── Imagen Generation & Upload ──
    flyer_bytes = await gemini_service.generate_flyer(input_text)
    flyer_url = None
    if flyer_bytes:
        flyer_url = storage_service.upload_flyer(flyer_bytes, phone)

    return CampaignResponse(
        professional=variants.get("professional", ""),
        hype=variants.get("hype", ""),
        sheng=variants.get("sheng", ""),
        sms=variants.get("sms", ""),
        flyer_url=flyer_url,
        credits_remaining=credits_remaining,
    )


@router.post("/generate-campaign/image", response_model=CampaignResponse)
async def generate_campaign_image(
    file: UploadFile = File(...),
    phone: str = Form(""),
    biz_name: str = Form(""),
    brand_keywords: str = Form(""),
):
    # ── Credit check ──
    if phone:
        user = supabase_client.get_user(phone)
        if user and user["credit_balance"] <= 0:
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

    if phone:
        supabase_client.deduct_credit(phone)

    return CampaignResponse(
        professional=variants.get("professional", ""),
        hype=variants.get("hype", ""),
        sheng=variants.get("sheng", ""),
        sms=variants.get("sms", ""),
    )


@router.post("/broadcast-sms")
async def broadcast_sms(
    recipients: list[str],
    message: str,
    phone: str = "",
):
    from services.at_service import send_bulk_sms
    result = send_bulk_sms(recipients, message)
    return result
