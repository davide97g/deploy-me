import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field

BARISTA_PROMPT = """Sei il barista di Caffè del Deploy, un caffè per sviluppatori italiani.
Il cliente ti passa note caotiche (idee, README bozzi, messaggi Slack, brain dump da vibe coding).
Tu le trasformi in testo pulito e professionale in italiano, pronto per README, LinkedIn o documentazione.
Mantieni un tono caldo e leggermente ironico. Max 200 parole. Niente emoji.
Se il testo è già in inglese, rispondi in inglese."""

load_dotenv()

app = FastAPI(title="Caffè del Deploy — Macinino")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class MacinaRequest(BaseModel):
    note: str = Field(min_length=1, max_length=8000)


class MacinaResponse(BaseModel):
    risultato: str


class HealthResponse(BaseModel):
    status: Literal["online"]
    barista: Literal["kimi", "mock"]


def mock_macina(note: str) -> str:
    return (
        "[MOCK — macinino locale] "
        "Ecco una versione più ordinata delle tue note:\n\n"
        f"{note.strip()}\n\n"
        "(Configura MOONSHOT_API_KEY per il barista Kimi vero.)"
    )


def kimi_macina(note: str) -> str:
    client = OpenAI(
        api_key=os.environ["MOONSHOT_API_KEY"],
        base_url="https://api.moonshot.ai/v1",
    )
    completion = client.chat.completions.create(
        model="kimi-k2-turbo-preview",
        messages=[
            {"role": "system", "content": BARISTA_PROMPT},
            {"role": "user", "content": note},
        ],
        max_tokens=1024,
    )
    content = completion.choices[0].message.content
    if not content:
        raise HTTPException(status_code=502, detail="Risposta vuota dal barista")
    return content.strip()


@app.get("/")
def root() -> dict[str, str]:
    return {
        "app": "Macinino v2",
        "host": "Vercel",
        "service": "FastAPI · serverless",
        "runtime": "Python",
    }


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    barista: Literal["kimi", "mock"] = "kimi" if os.environ.get("MOONSHOT_API_KEY") else "mock"
    return HealthResponse(status="online", barista=barista)


@app.post("/macina", response_model=MacinaResponse)
def macina(body: MacinaRequest) -> MacinaResponse:
    try:
        if os.environ.get("MOONSHOT_API_KEY"):
            risultato = kimi_macina(body.note)
        else:
            risultato = mock_macina(body.note)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Macinino fuori servizio: {exc}") from exc
    return MacinaResponse(risultato=risultato)
