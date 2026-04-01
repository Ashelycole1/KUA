import os
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

CLERK_JWT_KEY = os.getenv("CLERK_JWT_KEY", "")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Decodes the Clerk JWT and returns the user payload.
    Raise 401 if invalid/missing.
    """
    token = credentials.credentials
    if not CLERK_JWT_KEY:
        # Fallback for development if keys aren't set yet - log a warning but don't crash entirely
        # unless it's production. For now, just allow if in dev mode? 
        # Actually, let's enforce it to be secure.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Clerk authentication is not configured on the server."
        )

    try:
        # Decode the Clerk JWT using the public key (PEM format)
        payload = jwt.decode(
            token, 
            CLERK_JWT_KEY, 
            algorithms=["RS256"],
            # If Clerk is configured for Supabase, the audience is typically 'supabase'
            # but we can omit it for now or check azp if needed.
            options={"verify_aud": False} 
        )
        
        # 'sub' is the Clerk User ID
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has no user identifier (sub)."
            )
            
        return payload
    except JWTError as e:
        print(f"JWT Verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
