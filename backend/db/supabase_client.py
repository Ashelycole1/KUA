import os
from supabase import create_client, Client

_client: Client | None = None
DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"

# ── Dev mock user returned when Supabase is not configured ──
DEV_USER = {
    "id": "00000000-0000-0000-0000-000000000001",
    "clerk_id": "dev_user_mock_id",
    "phone_number": "+254700000000",
    "email": "dev@kua.local",
    "biz_name": "Dev Shop",
    "credit_balance": 100,
    "balance": 0.0,
    "currency_code": "KES",
    "account_type": "merchant",
}


def _is_configured() -> bool:
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_KEY", "")
    return bool(url and key and url != "http://localhost:8000" and key != "dummy")


def get_supabase() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", "http://localhost:8000")
        key = os.getenv("SUPABASE_KEY", "dummy")
        _client = create_client(url, key)
    return _client


def get_user_by_clerk_id(clerk_id: str) -> dict | None:
    if not _is_configured():
        if DEV_MODE and clerk_id == "dev_user_mock_id":
            return DEV_USER
        return None
    try:
        res = get_supabase().table("users").select("*").eq("clerk_id", clerk_id).single().execute()
        return res.data
    except Exception as e:
        print(f"SUPABASE ERROR (get_user_by_clerk_id): {e}")
        return None


def get_user(phone: str) -> dict | None:
    if not _is_configured():
        if DEV_MODE and phone == DEV_USER["phone_number"]:
            return DEV_USER
        return None
    try:
        res = get_supabase().table("users").select("*").eq("phone_number", phone).single().execute()
        return res.data
    except Exception as e:
        print(f"SUPABASE ERROR (get_user): {e}")
        return None


def deduct_balance(clerk_id: str, amount: float) -> bool:
    if not _is_configured():
        return DEV_MODE
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
    if not _is_configured():
        print("DEV_MODE: Skipping credit deduction (no Supabase)")
        return True
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
    if not _is_configured():
        return DEV_MODE
    try:
        user = get_user(phone)
        if user:
            new_bal = user["credit_balance"] + amount
            get_supabase().table("users").update(
                {"credit_balance": new_bal}
            ).eq("phone_number", phone).execute()
        else:
            get_supabase().table("users").insert(
                {"phone_number": phone, "credit_balance": amount}
            ).execute()
        return True
    except Exception as e:
        print(f"SUPABASE ERROR (add_credits): {e}")
        return False


def add_balance(phone: str, amount: float) -> bool:
    if not _is_configured():
        return DEV_MODE
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
    """Get or create a user by clerk_id. Returns dev mock if Supabase not configured."""
    if not _is_configured():
        if DEV_MODE:
            print(f"DEV_MODE: upsert_user called for clerk_id={clerk_id}, returning mock user")
            return {**DEV_USER, "clerk_id": clerk_id, "phone_number": phone}
        raise RuntimeError("Supabase is not configured")
    try:
        user = get_user_by_clerk_id(clerk_id)
        if user:
            if user.get("phone_number") != phone:
                get_supabase().table("users").update({"phone_number": phone}).eq("clerk_id", clerk_id).execute()
                user["phone_number"] = phone
            return user

        user_by_phone = get_user(phone)
        if user_by_phone and not user_by_phone.get("clerk_id"):
            get_supabase().table("users").update({"clerk_id": clerk_id}).eq("phone_number", phone).execute()
            user_by_phone["clerk_id"] = clerk_id
            return user_by_phone

        res = get_supabase().table("users").insert(
            {"clerk_id": clerk_id, "phone_number": phone, "credit_balance": 100, "balance": 0.0, "currency_code": currency_code}
        ).execute()
        return res.data[0] if res.data else {**DEV_USER, "clerk_id": clerk_id, "phone_number": phone}

    except Exception as e:
        print(f"SUPABASE ERROR (upsert_user): {e}")
        raise e


def save_campaign(phone: str, prompt: str, variants: dict, tone_selected: str = "warm", flyer_url: str = "") -> bool:
    """Save generated campaign to DB."""
    if not _is_configured():
        print(f"DEV_MODE: Campaign saved locally (no Supabase) — prompt='{prompt[:60]}'")
        return True
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
        print(f"✅ Campaign saved to Supabase for phone={phone}")
        return True
    except Exception as e:
        print(f"Error saving campaign: {e}")
        return False


def get_campaign_history(phone: str) -> list:
    """Fetch campaign history for a user."""
    if not _is_configured():
        return []
    try:
        res = get_supabase().table("campaigns").select("*").eq("user_phone", phone).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []


def get_ambassadors(merchant_phone: str) -> list:
    if not _is_configured():
        return []
    try:
        res = get_supabase().table("ambassadors").select("*").eq("merchant_phone", merchant_phone).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print(f"SUPABASE ERROR (get_ambassadors): {e}")
        return []


def create_ambassador(merchant_phone: str, name: str, phone: str, payout_method: str = "mpesa") -> dict | None:
    if not _is_configured():
        return {"id": "dev-amb-001", "merchant_phone": merchant_phone, "name": name, "phone": phone, "payout_method": payout_method}
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
    if not _is_configured():
        return {"id": "dev-payout-001", "ambassador_id": ambassador_id, "amount": amount, "status": "completed"}
    try:
        res = get_supabase().table("payouts").insert({
            "ambassador_id": ambassador_id,
            "amount": amount,
            "status": "completed"
        }).execute()

        ambassador = get_supabase().table("ambassadors").select("total_earned").eq("id", ambassador_id).single().execute()
        if ambassador.data:
            new_earned = float(ambassador.data.get("total_earned", 0.0)) + amount
            get_supabase().table("ambassadors").update({"total_earned": new_earned}).eq("id", ambassador_id).execute()

        return res.data[0] if res.data else None
    except Exception as e:
        print(f"SUPABASE ERROR (create_payout): {e}")
        return None
