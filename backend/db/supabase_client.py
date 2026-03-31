import os
from supabase import create_client, Client

_client: Client | None = None

def get_supabase() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        _client = create_client(url, key)
    return _client


def get_user(phone: str) -> dict | None:
    try:
        res = get_supabase().table("users").select("*").eq("phone_number", phone).single().execute()
        return res.data
    except Exception:
        return None


def deduct_credit(phone: str) -> bool:
    try:
        user = get_user(phone)
        if not user or user["credit_balance"] <= 0:
            return False
        get_supabase().table("users").update(
            {"credit_balance": user["credit_balance"] - 1}
        ).eq("phone_number", phone).execute()
        return True
    except Exception:
        return False


def add_credits(phone: str, amount: int = 10) -> bool:
    try:
        user = get_user(phone)
        if user:
            new_bal = user["credit_balance"] + amount
            get_supabase().table("users").update(
                {"credit_balance": new_bal}
            ).eq("phone_number", phone).execute()
        else:
            # Create user with credits
            get_supabase().table("users").insert(
                {"phone_number": phone, "credit_balance": amount}
            ).execute()
        return True
    except Exception:
        return False


def upsert_user(phone: str, currency_code: str = 'KES') -> dict:
    """Get or create a user, returning their record."""
    try:
        user = get_user(phone)
        if user:
            return user
        get_supabase().table("users").insert(
            {"phone_number": phone, "credit_balance": 3, "currency_code": currency_code}
        ).execute()
        return {"phone_number": phone, "credit_balance": 3, "currency_code": currency_code}
    except Exception:
        return {"phone_number": phone, "credit_balance": 3, "currency_code": currency_code}


def save_campaign(phone: str, prompt: str, variants: dict, flyer_url: str = "") -> bool:
    """Save generated campaign to DB."""
    try:
        get_supabase().table("campaigns").insert({
            "user_phone": phone,
            "prompt": prompt,
            "professional": variants.get("professional", ""),
            "hype": variants.get("hype", ""),
            "sheng": variants.get("sheng", ""),
            "sms": variants.get("sms", ""),
            "flyer_url": flyer_url,
        }).execute()
        return True
    except Exception as e:
        print(f"Error saving campaign: {e}")
        return False


def get_campaign_history(phone: str) -> list:
    """Fetch campaign history for a user."""
    try:
        res = get_supabase().table("campaigns").select("*").eq("user_phone", phone).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []
