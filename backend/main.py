import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import campaign, payments, auth

app = FastAPI(title="Kua API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000"), "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(campaign.router)
app.include_router(payments.router)
app.include_router(auth.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "kua-api"}
