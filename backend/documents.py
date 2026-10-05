from io import BytesIO

import pymupdf
import pytesseract
from docx import Document
from PIL import Image


def extract_text(filename, data):
    name = filename.lower()
    if name.endswith(".pdf"):
        return extract_pdf(data)
    if name.endswith(".docx"):
        return extract_docx(data)
    raise ValueError("Only PDF and DOCX files are supported")


def extract_pdf(data):
    pages = []
    pdf = pymupdf.open(stream=data, filetype="pdf")
    for index, page in enumerate(pdf, start=1):
        text = page.get_text().strip()
        if not text:
            pix = page.get_pixmap(dpi=200)
            image = Image.open(BytesIO(pix.tobytes("png")))
            text = pytesseract.image_to_string(image).strip()
        if text:
            pages.append({"page": index, "text": text})
    return pages


def extract_docx(data):
    doc = Document(BytesIO(data))
    text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    return [{"page": 1, "text": text.strip()}] if text.strip() else []


def chunk_pages(pages, size=900, overlap=120):
    chunks = []
    for page in pages:
        words = page["text"].split()
        start = 0
        while start < len(words):
            part = " ".join(words[start:start + size]).strip()
            if part:
                chunks.append({"page": page["page"], "content": part})
            start += size - overlap
    return chunks
