import os
import africastalking

AT_USERNAME = os.getenv("AT_USERNAME", "sandbox")
AT_API_KEY  = os.getenv("AT_API_KEY", "")

africastalking.initialize(AT_USERNAME, AT_API_KEY)
_sms = africastalking.SMS
_pay = getattr(africastalking, "Payment", None)


def send_stk_push(phone: str, amount: float = 100.0) -> dict:
    """Initiate M-Pesa STK Push via Africa's Talking."""
    try:
        recipients = [{"phoneNumber": phone, "amount": f"KES {amount}"}]
        if not _pay:
            return {"status": "pending", "data": {"status": "mocked"}}
        response = _pay.mobile_checkout(
            product_name="KuaCredits",
            recipients=recipients,
        )
        return {"status": "pending", "data": response}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def send_bulk_sms(recipients: list[str], message: str, sender_id: str = "Kua") -> dict:
    """Send bulk SMS via Africa's Talking SMS API."""
    try:
        response = _sms.send(message, recipients, sender_id=sender_id)
        return {"status": "sent", "data": response}
    except Exception as e:
        return {"status": "error", "message": str(e)}
