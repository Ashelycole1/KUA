from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import math
from services.auth_deps import get_current_user
from services.at_service import send_bulk_sms
from db import supabase_client

router = APIRouter(prefix="/broadcast", tags=["broadcast"])

class BroadcastRequest(BaseModel):
    recipients: List[str]
    message: str
    sender_id: Optional[str] = "Kua"

@router.post("/send")
async def send_broadcast(req: BroadcastRequest, user_payload: dict = Depends(get_current_user)):
    clerk_id = user_payload.get("sub")
    num_recipients = len(req.recipients)

    if num_recipients == 0:
        raise HTTPException(status_code=400, detail="No recipients provided.")

    # 1. Fetch user to check credits
    user = supabase_client.get_user_by_clerk_id(clerk_id)
    if not user:
        import os
        if os.getenv("DEV_MODE", "true").lower() == "true":
            user = supabase_client.DEV_USER
        else:
            raise HTTPException(status_code=404, detail="User not found.")

    current_credits = user.get("credit_balance", 0)

    # 2. Calculate Credit Cost (1 Credit per 20 recipients)
    required_credits = math.ceil(num_recipients / 20)

    if current_credits < required_credits:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits. Required: {required_credits}, Current: {current_credits}"
        )

    # 3. Send Bulk SMS via Africa's Talking
    at_res = send_bulk_sms(req.recipients, req.message, sender_id=req.sender_id)

    if at_res["status"] == "error":
        raise HTTPException(status_code=500, detail=f"Africa's Talking error: {at_res['message']}")

    # 4. Deduct Credits (skip in dev mode if not configured)
    supabase_client.deduct_credit(user["phone_number"])
    new_credits = current_credits - required_credits

    # 5. Log Broadcast (only if Supabase configured)
    if supabase_client._is_configured():
        supabase_client.get_supabase().table("broadcasts").insert({
            "clerk_id": clerk_id,
            "message": req.message,
            "recipient_count": num_recipients,
            "recipients_json": req.recipients,
            "total_cost_credits": required_credits,
            "status": "sent"
        }).execute()

    return {
        "status": "success",
        "recipients_sent": num_recipients,
        "credits_deducted": required_credits,
        "remaining_credits": new_credits
    }

@router.get("/history")
async def get_broadcast_history(user_payload: dict = Depends(get_current_user)):
    clerk_id = user_payload.get("sub")
    if not supabase_client._is_configured():
        return []
    res = supabase_client.get_supabase().table("broadcasts").select("*").eq("clerk_id", clerk_id).order("created_at", desc=True).execute()
    return res.data
