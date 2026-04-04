from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from db import supabase_client
from services.auth_deps import get_current_user

router = APIRouter(prefix="/ambassadors", tags=["ambassadors"])

class AmbassadorRequest(BaseModel):
    name: str
    phone: str
    payout_method: Optional[str] = "mpesa"

class PayoutRequest(BaseModel):
    amount: float

@router.get("", response_model=list[dict])
async def list_ambassadors(decoded: dict = Depends(get_current_user)):
    """List all ambassadors belonging to the authenticated merchant."""
    clerk_id = decoded.get("sub")
    user = supabase_client.get_user_by_clerk_id(clerk_id)
    if not user:
        raise HTTPException(status_code=401, detail="User profile not initialized.")
        
    merchant_phone = user["phone_number"]
    ambassadors_list = supabase_client.get_ambassadors(merchant_phone)
    return ambassadors_list or []

@router.post("", response_model=dict)
async def add_ambassador(req: AmbassadorRequest, decoded: dict = Depends(get_current_user)):
    """Add a new ambassador to the merchant's network."""
    clerk_id = decoded.get("sub")
    user = supabase_client.get_user_by_clerk_id(clerk_id)
    if not user:
        raise HTTPException(status_code=401, detail="User profile not initialized.")
        
    merchant_phone = user["phone_number"]

    ambassador = supabase_client.create_ambassador(
        merchant_phone=merchant_phone,
        name=req.name,
        phone=req.phone,
        payout_method=req.payout_method
    )
    if not ambassador:
        raise HTTPException(status_code=400, detail="Failed to create ambassador")
    return ambassador

@router.post("/{ambassador_id}/pay", response_model=dict)
async def pay_ambassador(ambassador_id: str, req: PayoutRequest, decoded: dict = Depends(get_current_user)):
    """Record a payout transaction to an established ambassador."""
    clerk_id = decoded.get("sub")
    user = supabase_client.get_user_by_clerk_id(clerk_id)
    if not user:
        raise HTTPException(status_code=401, detail="User profile not initialized.")
    
    # Check if we should enforce deducting merchant balance (future extension)
    
    payout = supabase_client.create_payout(
        ambassador_id=ambassador_id,
        amount=req.amount
    )
    if not payout:
        raise HTTPException(status_code=400, detail="Failed to record payout")
    return payout
