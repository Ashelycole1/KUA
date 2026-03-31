import os

PROJECT_ID   = os.getenv("GOOGLE_CLOUD_PROJECT", "")
PROCESSOR_ID = os.getenv("DOCAI_PROCESSOR_ID", "")


async def ocr_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """
    Send image to Google Document AI and return extracted text.
    Falls back gracefully to empty string if DocAI is not configured,
    so the caller (campaign router) uses Gemini Vision instead.
    """
    if not PROJECT_ID or not PROCESSOR_ID or PROJECT_ID == "your_gcp_project_id":
        return ""

    try:
        from google.cloud import documentai
        client = documentai.DocumentProcessorServiceClient()
        name = client.processor_path(PROJECT_ID, "us", PROCESSOR_ID)
        raw_document = documentai.RawDocument(content=image_bytes, mime_type=mime_type)
        request = documentai.ProcessRequest(name=name, raw_document=raw_document)
        result = client.process_document(request=request)
        return result.document.text
    except Exception as e:
        print(f"DocAI Error: {e}")
        return ""
