from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Initiate token extraction from headers
security = HTTPBearer()


def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Local import prevents circular initialization blocks
    from main import supabase

    token = credentials.credentials
    try:
        # get_user verifies the signature and checks expiration
        user_response = supabase.auth.get_user(token)

        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_response.user

    except Exception as e:
        # Catches explicit validation failures from the underlying network layer
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


# role validation middleware

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):

        self.allowed_roles = allowed_roles

    def __call__(self, user=Depends(verify_jwt)):

        # default role student
        user_role = user.user_metadata.get("role", "student")

        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Your role '{user_role}' lacks permissions."
            )

        return user