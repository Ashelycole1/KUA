from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from db import supabase_client
from services.at_service import send_stk_push

router = APIRouter(prefix="/momo", tags=["payments"])


class TopUpRequest(BaseModel):
    phone: str
    amount: float = 100.0
    currency: str = "KES"


@router.post("/initiate")
async def initiate_payment(req: TopUpRequest):
    """Trigger MoMo/M-Pesa STK Push via Africa's Talking."""
    result = send_stk_push(req.phone, req.amount)
    # Ensure user record exists with local currency
    supabase_client.upsert_user(req.phone, req.currency)
    return result


@router.post("/webhook")
async def payment_webhook(request: Request):
    """
    Receive Africa's Talking / Beyonic payment callback.
    On successful 100/- payment → +10 credits.
    """
    try:
        data = await request.form()
        status       = data.get("Status", data.get("status", ""))
        phone        = data.get("PhoneNumber", data.get("phone", ""))
        value        = data.get("Value", data.get("amount", "0"))
        checkout_id  = data.get("checkoutRequestID", "")

        # Normalise phone
        phone = phone.strip().replace(" ", "")
        if phone.startswith("0"):
            phone = "+254" + phone[1:]

        if status.lower() in ("success", "succeeded", "complete"):
            import re
            value_str = str(value).strip()
            
            currency_match = re.search(r"^[A-Za-z]+", value_str)
            currency = currency_match.group(0).upper() if currency_match else "KES"
            amount_str = re.sub(r"[^\d.]", "", value_str)
            amount = float(amount_str) if amount_str else 0.0

            # Dynamic price per 10 credits lookup
            rates = {
                "KES": 100,
                "UGX": 3000,
                "NGN": 1200,
                "GHS": 15,
                "ZAR": 15,
                "TZS": 2000,
                "RWF": 1000
            }
            price_per_10 = rates.get(currency, 100)
            credits = round((amount / price_per_10) * 10)
            
            supabase_client.add_credits(phone, credits)
            return {"message": f"Added {credits} credits to {phone}"}

        return {"message": "Payment not successful, no action taken", "status": status}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
