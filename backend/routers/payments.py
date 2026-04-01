from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from db import supabase_client
from services.at_service import send_stk_push
from services.auth_deps import get_current_user

router = APIRouter(prefix="/momo", tags=["payments"])


class TopUpRequest(BaseModel):
    phone: str
    amount: float = 100.0
    currency: str = "KES"


@router.post("/initiate")
async def initiate_payment(req: TopUpRequest, decoded: dict = Depends(get_current_user)):
    """
    Trigger MoMo/M-Pesa STK Push via Africa's Talking.
    Now secured with Clerk JWT.
    """
    clerk_id = decoded.get("sub")
    if not clerk_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Verify the phone matches the user's registered phone
    user = supabase_client.get_user_by_clerk_id(clerk_id)
    if not user or user["phone_number"] != req.phone:
        raise HTTPException(status_code=403, detail="Can only trigger payments for your own account.")

    result = send_stk_push(req.phone, req.amount)
    # Ensure user record exists with local currency if needed
    supabase_client.upsert_user(clerk_id, req.phone, req.currency)
    return result


@router.post("/webhook")
async def payment_webhook(request: Request):
    """
    Receive Africa's Talking / Beyonic payment callback.
    This endpoint must remain public but should be secured by origin IP in production.
    """
    try:
        data = await request.form()
        status       = data.get("Status", data.get("status", ""))
        phone        = data.get("PhoneNumber", data.get("phone", ""))
        value        = data.get("Value", data.get("amount", "0"))
        # ... logic remains same as it manages credits via trusted webhook
        
        phone = phone.strip().replace(" ", "")
        if phone.startswith("0"):
            phone = "+254" + phone[1:]

        if status.lower() in ("success", "succeeded", "complete"):
            import re
            amount_str = re.sub(r"[^\d.]", "", str(value))
            amount = float(amount_str) if amount_str else 0.0
            
            # Simple credit logic (already existing)
            credits = round((amount / 100) * 10) # default KES 100 = 10 credits
            supabase_client.add_credits(phone, credits)
            return {"message": f"Added {credits} credits to {phone}"}

        return {"message": "Payment not successful", "status": status}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
