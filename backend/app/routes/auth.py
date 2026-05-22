from uuid import uuid4

from fastapi import APIRouter

from app.models.schemas import AuthResponse, UserCreate, UserLogin, UserResponse

router = APIRouter()


@router.post("/signup", response_model=AuthResponse)
async def signup(payload: UserCreate) -> AuthResponse:
    user = UserResponse(id=str(uuid4()), name=payload.name, email=payload.email)
    return AuthResponse(token=f"demo-token-{user.id}", user=user)


@router.post("/login", response_model=AuthResponse)
async def login(payload: UserLogin) -> AuthResponse:
    name = payload.email.split("@")[0].replace(".", " ").title()
    user = UserResponse(id=str(uuid4()), name=name, email=payload.email)
    return AuthResponse(token=f"demo-token-{user.id}", user=user)
