from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from db import supabase_client

router = APIRouter(prefix="/auth", tags=["auth"])


class AuthRequest(BaseModel):
    phone: str
    biz_name: Optional[str] = ""
    biz_type: Optional[str] = ""
    brand_keywords: Optional[str] = ""
    currency_code: str = "KES"


class AuthResponse(BaseModel):
    phone_number: str
    credit_balance: int
    currency_code: str


@router.post("/login", response_model=AuthResponse)
async def login_user(req: AuthRequest):
    if not req.phone:
        raise HTTPException(status_code=400, detail="Phone number is required.")

    # upsert_user seamlessly fetches the wallet or creates a new one with 3 initial promo credits.
    user_data = supabase_client.upsert_user(req.phone, req.currency_code)
    
    # Normally, you would optionally update their brand keywords/biz_name in DB here.
    # We mainly need the credit balance returned.
    
    return AuthResponse(
        phone_number=user_data.get("phone_number", req.phone),
        credit_balance=user_data.get("credit_balance", 0),
        currency_code=user_data.get("currency_code", req.currency_code)
    )
