from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from api.core.translation.LLMTranslator import translate_text

router = APIRouter(prefix="/translation", tags=["translation"])

class TranslationRequest(BaseModel):
    text: str

class TranslationResponse(BaseModel):
    translation: str

@router.post("/grammar-translation", response_model=TranslationResponse)
async def translate(request: TranslationRequest):
    try:
        translated_text = translate_text(request.text)
        return {"translation": translated_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
