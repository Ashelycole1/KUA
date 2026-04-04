import os
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)

CLERK_JWT_KEY = os.getenv("CLERK_JWT_KEY", "")
DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Decodes the Clerk JWT and returns the user payload.
    In DEV_MODE with no CLERK_JWT_KEY set, returns a mock user for local testing.
    Raises 401 if invalid in production.
    """
    token = credentials.credentials if credentials else None

    # ── Dev bypass: no Clerk key configured ──
    if not CLERK_JWT_KEY:
        if DEV_MODE:
            print("⚠️  DEV_MODE: No CLERK_JWT_KEY set. Using mock user for local testing.")
            return {
                "sub": "dev_user_mock_id",
                "email": "dev@kua.local",
                "phone": "+254700000000",
            }
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Clerk authentication is not configured on the server.",
        )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            token,
            CLERK_JWT_KEY,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has no user identifier (sub).",
            )
        return payload
    except JWTError as e:
        print(f"JWT Verification failed: {e}")
        if DEV_MODE:
            print("⚠️  DEV_MODE: JWT failed, falling back to mock user.")
            return {
                "sub": "dev_user_mock_id",
                "email": "dev@kua.local",
                "phone": "+254700000000",
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
