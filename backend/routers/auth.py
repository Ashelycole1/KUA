from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from db import supabase_client
from services.auth_deps import get_current_user

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
async def login_user(req: AuthRequest, decoded: dict = Depends(get_current_user)):
    """
    Login endpoint now requires a valid Clerk JWT.
    It links the Clerk Identity to a Kua user record.
    """
    # Use 'sub' from clerk token as the unique identifier
    clerk_id = decoded.get("sub")
    if not clerk_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing sub claim.")

    # Cross-verify if needed (e.g., if the phone in the token matches the one in the request).
    # Clerk tokens usually include phone_number if requested in the JWT template.
    token_phone = decoded.get("phone_number")
    # For now, we trust the verified clerk_id and associate it with the provided phone.
    
    user_data = supabase_client.upsert_user(
        clerk_id=clerk_id, 
        phone=req.phone, 
        currency_code=req.currency_code
    )
    
    return AuthResponse(
        phone_number=user_data.get("phone_number", req.phone),
        credit_balance=user_data.get("credit_balance", 0),
        currency_code=user_data.get("currency_code", req.currency_code)
    )
