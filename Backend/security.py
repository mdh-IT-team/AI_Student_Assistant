from typing import List
from types import SimpleNamespace
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Initiate token extraction from headers
security = HTTPBearer()


def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Local import prevents circular initialization blocks
    from main import supabase

    token = credentials.credentials
    try:
        # NOTE: this project uses Supabase's new (asymmetric, ES256) JWT
        # signing keys. supabase.auth.get_user(token) breaks against those
        # (see supabase-py issue #1183 — it raises "This endpoint requires
        # a valid Bearer token"). get_claims() is the fix Supabase recommends:
        # it verifies the JWT locally against the project's JWKS endpoint
        # instead of round-tripping to the Auth server, and works with both
        # legacy (HS256) and new (ES256/RSA) signing keys.
        # get_claims() returns a ClaimsResponse TypedDict (a plain dict at
        # runtime, not an object) shaped like {"claims": {...}, "headers":
        # {...}, "signature": ...}. Must use dict access, not getattr.
        claims_response = supabase.auth.get_claims(token)
        claims = claims_response.get("claims") if claims_response else None

        if not claims or not claims.get("sub"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Wrap the claims dict so the rest of the codebase can keep using
        # dot-notation (current_user.id / .email / .user_metadata) exactly
        # like it did with the old get_user().user object.
        return SimpleNamespace(
            id=claims.get("sub"),
            email=claims.get("email"),
            user_metadata=claims.get("user_metadata", {}) or {},
            # Not present in JWT claims (only via the full get_user() lookup);
            # kept as None so callers reading these fields don't crash.
            created_at=None,
            last_sign_in_at=None,
        )

    except HTTPException:
        raise
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