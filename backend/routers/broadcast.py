from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import math
from services.auth_deps import get_current_user
from services.at_service import send_bulk_sms
from db.supabase_client import supabase

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
    user_res = supabase.table("users").select("*").eq("clerk_id", clerk_id).single().execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="User not found.")
    
    user = user_res.data
    current_credits = user.get("credit_balance", 0)
    
    # 2. Calculate Credit Cost (1 Credit per 20 recipients)
    required_credits = math.ceil(num_recipients / 20)
    
    if current_credits < required_credits:
        raise HTTPException(
            status_code= status.HTTP_402_PAYMENT_REQUIRED, 
            detail=f"Insufficient credits. Required: {required_credits}, Current: {current_credits}"
        )

    # 3. Send Bulk SMS via Africa's Talking
    at_res = send_bulk_sms(req.recipients, req.message, sender_id=req.sender_id)
    
    if at_res["status"] == "error":
        raise HTTPException(status_code=500, detail=f"Africa's Talking error: {at_res['message']}")

    # 4. Deduct Credits
    new_credits = current_credits - required_credits
    supabase.table("users").update({"credit_balance": new_credits}).eq("clerk_id", clerk_id).execute()

    # 5. Log Broadcast
    supabase.table("broadcasts").insert({
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
    res = supabase.table("broadcasts").select("*").eq("clerk_id", clerk_id).order("created_at", desc=True).execute()
    return res.data
