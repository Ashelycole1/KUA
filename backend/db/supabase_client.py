import os
from supabase import create_client, Client

_client: Client | None = None

def get_supabase() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", "http://localhost:8000")
        key = os.getenv("SUPABASE_KEY", "dummy")
        _client = create_client(url, key)
    return _client

# Global instance for easier import in routers
supabase = get_supabase()


def get_user_by_clerk_id(clerk_id: str) -> dict | None:
    try:
        res = get_supabase().table("users").select("*").eq("clerk_id", clerk_id).single().execute()
        return res.data
    except Exception as e:
        print(f"SUPABASE ERROR (get_user_by_clerk_id): {e}")
        return None


def get_user(phone: str) -> dict | None:
    try:
        res = get_supabase().table("users").select("*").eq("phone_number", phone).single().execute()
        return res.data
    except Exception as e:
        print(f"SUPABASE ERROR (get_user): {e}")
        return None


def deduct_balance(clerk_id: str, amount: float) -> bool:
    try:
        res = get_supabase().table("users").select("balance").eq("clerk_id", clerk_id).single().execute()
        if not res.data:
            return False
        current = float(res.data.get("balance", 0.0))
        if current < amount:
            return False
        get_supabase().table("users").update(
            {"balance": current - amount}
        ).eq("clerk_id", clerk_id).execute()
        return True
    except Exception as e:
        print(f"SUPABASE ERROR (deduct_balance): {e}")
        return False


def deduct_credit(phone: str) -> bool:
    try:
        user = get_user(phone)
        if not user or user["credit_balance"] <= 0:
            return False
        get_supabase().table("users").update(
            {"credit_balance": user["credit_balance"] - 1}
        ).eq("phone_number", phone).execute()
        return True
    except Exception as e:
        print(f"SUPABASE ERROR (deduct_credit): {e}")
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
    except Exception as e:
        print(f"SUPABASE ERROR (add_credits): {e}")
        return False
def add_balance(phone: str, amount: float) -> bool:
    try:
        user = get_user(phone)
        if user:
            new_bal = float(user.get("balance", 0.0)) + amount
            get_supabase().table("users").update(
                {"balance": new_bal}
            ).eq("phone_number", phone).execute()
            return True
        return False
    except Exception as e:
        print(f"SUPABASE ERROR (add_balance): {e}")
        return False


def upsert_user(clerk_id: str, phone: str, currency_code: str = 'KES') -> dict:
    """Get or create a user by clerk_id, returning their record."""
    try:
        user = get_user_by_clerk_id(clerk_id)
        if user:
            # If phone changed or wasn't set, update it
            if user.get("phone_number") != phone:
                get_supabase().table("users").update({"phone_number": phone}).eq("clerk_id", clerk_id).execute()
                user["phone_number"] = phone
            return user
            
        # Try to find by phone if clerk_id is missing (migration case)
        user_by_phone = get_user(phone)
        if user_by_phone and not user_by_phone.get("clerk_id"):
            get_supabase().table("users").update({"clerk_id": clerk_id}).eq("phone_number", phone).execute()
            user_by_phone["clerk_id"] = clerk_id
            return user_by_phone

        # Create new user
        res = get_supabase().table("users").insert(
            {"clerk_id": clerk_id, "phone_number": phone, "credit_balance": 100, "balance": 0.0, "currency_code": currency_code}
        ).execute()
        return res.data[0] if res.data else {"clerk_id": clerk_id, "phone_number": phone, "credit_balance": 100, "balance": 0.0, "currency_code": currency_code}
        
    except Exception as e:
        print(f"SUPABASE ERROR (upsert_user): {e}")
        raise e


def save_campaign(phone: str, prompt: str, variants: dict, tone_selected: str = "warm", flyer_url: str = "") -> bool:
    """Save generated campaign to DB."""
    try:
        get_supabase().table("campaigns").insert({
            "user_phone": phone,
            "prompt": prompt,
            "tone": tone_selected,
            "professional": variants.get("professional", ""),
            "hype": variants.get("hype", ""),
            "sheng": variants.get("sheng", ""),
            "sms": variants.get("sms", ""),
            "ambassador_message": variants.get("ambassador_message", ""),
            "flyer_url": flyer_url,
        }).execute()
        return True
    except Exception as e:
        print(f"Error saving campaign: {e}")
        return False


def get_campaign_history(phone: str) -> list:
    """Fetch campaign history for a user - currently still using phone for compatibility."""
    try:
        res = get_supabase().table("campaigns").select("*").eq("user_phone", phone).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []


def get_ambassadors(merchant_phone: str) -> list:
    try:
        res = get_supabase().table("ambassadors").select("*").eq("merchant_phone", merchant_phone).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print(f"SUPABASE ERROR (get_ambassadors): {e}")
        return []


def create_ambassador(merchant_phone: str, name: str, phone: str, payout_method: str = "mtn") -> dict | None:
    try:
        res = get_supabase().table("ambassadors").insert({
            "merchant_phone": merchant_phone,
            "name": name,
            "phone": phone,
            "payout_method": payout_method
        }).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"SUPABASE ERROR (create_ambassador): {e}")
        return None


def create_payout(ambassador_id: str, amount: float) -> dict | None:
    try:
        res = get_supabase().table("payouts").insert({
            "ambassador_id": ambassador_id,
            "amount": amount,
            "status": "completed"
        }).execute()
        
        # Increment total_earned for the ambassador
        ambassador = get_supabase().table("ambassadors").select("total_earned").eq("id", ambassador_id).single().execute()
        if ambassador.data:
            new_earned = float(ambassador.data.get("total_earned", 0.0)) + amount
            get_supabase().table("ambassadors").update({"total_earned": new_earned}).eq("id", ambassador_id).execute()
            
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"SUPABASE ERROR (create_payout): {e}")
        return None
