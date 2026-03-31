import os
from google.cloud import documentai

PROJECT_ID    = os.getenv("GOOGLE_CLOUD_PROJECT", "")
LOCATION      = "us"          # Document AI multi-region
PROCESSOR_ID  = os.getenv("DOCAI_PROCESSOR_ID", "")


async def ocr_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """Send image to Google Document AI and return extracted text."""
    if not PROJECT_ID or not PROCESSOR_ID:
        return ""

    try:
        client = documentai.DocumentProcessorServiceClient()
        name = client.processor_path(PROJECT_ID, LOCATION, PROCESSOR_ID)

        raw_document = documentai.RawDocument(
            content=image_bytes,
            mime_type=mime_type,
        )
        request = documentai.ProcessRequest(
            name=name,
            raw_document=raw_document,
        )
        result = client.process_document(request=request)
        return result.document.text
    except Exception as e:
        return ""  # Graceful fallback — caller will use Gemini vision instead
