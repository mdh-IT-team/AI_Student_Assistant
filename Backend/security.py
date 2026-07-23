from typing import List
from types import SimpleNamespace
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
    from main import supabase
    token = credentials.credentials
    try:
        claims_response = supabase.auth.get_claims(token)
        claims = claims_response.get("claims") if claims_response else None

        if not claims or not claims.get("sub"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return SimpleNamespace(
            id=claims.get("sub"),
            email=claims.get("email"),
            user_metadata=claims.get("user_metadata", {}) or {},
            created_at=None,
            last_sign_in_at=None,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user=Depends(verify_jwt)):
        # Use the service-role client: the anon client is blocked by RLS
        # and would silently return zero rows, defaulting everyone to "student".
        from main import supabase_admin

        user_role = "student"
        try:
            res = supabase_admin.schema("ai_student").table("users").select("role").eq("id", user.id).execute()
            if res.data and len(res.data) > 0:
                user_role = res.data[0].get("role", "student")
        except Exception as e:
            print(f"RoleChecker lookup failed: {e}")

        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Your role '{user_role}' lacks permissions."
            )
        return user