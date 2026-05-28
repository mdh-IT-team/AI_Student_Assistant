from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# initiate token extraction from headers
security = HTTPBearer()

def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):

    from main import supabase

    token = credentials.credentials
    try:
        # get_user verify the signature and checks expiration
        user_response = supabase.auth.get_user(token)

        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_response.user

    except Exception as e:
        # catch specific verification errors
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )