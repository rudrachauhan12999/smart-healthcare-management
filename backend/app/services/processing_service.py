import io
import re
from pathlib import Path
from typing import Any, Dict, Optional

import fitz
import pytesseract
from PIL import Image


def extract_pdf_text(file_bytes: bytes) -> str:
    """Extract text from a PDF using PyMuPDF."""

    try:
        document = fitz.open(
            stream=file_bytes,
            filetype="pdf"
        )

        pages = []

        for page in document:
            text = page.get_text("text")

            if text:
                pages.append(text)

        text = "\n".join(pages).strip()

        # If the PDF contains little/no selectable text,
        # use OCR as a fallback.
        if len(text) < 50:
            ocr_pages = []

            for page in document:
                pixmap = page.get_pixmap(
                    matrix=fitz.Matrix(2, 2)
                )

                image = Image.open(
                    io.BytesIO(
                        pixmap.tobytes("png")
                    )
                )

                ocr_text = pytesseract.image_to_string(image)

                if ocr_text:
                    ocr_pages.append(ocr_text)

            text = "\n".join(ocr_pages).strip()

        document.close()

        return text

    except Exception as exc:
        raise RuntimeError(
            f"PDF extraction failed: {exc}"
        ) from exc


def extract_image_text(file_bytes: bytes) -> str:
    """Extract text from an image using Tesseract OCR."""

    try:
        image = Image.open(
            io.BytesIO(file_bytes)
        )

        return pytesseract.image_to_string(
            image
        ).strip()

    except Exception as exc:
        raise RuntimeError(
            f"Image OCR failed: {exc}"
        ) from exc


def classify_document(
    text: str,
    filename: str = ""
) -> str:
    """Classify a document using simple keyword rules."""

    content = f"{filename} {text}".lower()

    if any(
        keyword in content
        for keyword in [
            "prescription",
            "dosage",
            "tablet",
            "medicine",
            "medication",
        ]
    ):
        return "prescription"

    if any(
        keyword in content
        for keyword in [
            "hemoglobin",
            "blood test",
            "laboratory",
            "lab report",
            "test result",
            "cbc",
        ]
    ):
        return "lab_report"

    if any(
        keyword in content
        for keyword in [
            "invoice",
            "bill amount",
            "amount due",
            "billing",
        ]
    ):
        return "invoice"

    if any(
        keyword in content
        for keyword in [
            "certificate",
            "certification",
        ]
    ):
        return "certificate"

    if any(
        keyword in content
        for keyword in [
            "diagnosis",
            "symptoms",
            "treatment",
            "clinical",
            "medical report",
        ]
    ):
        return "medical_report"

    return "other"


def _find_value(
    text: str,
    labels: list[str]
) -> Optional[str]:
    """Find a simple value following one of several labels."""

    for label in labels:
        pattern = (
            rf"{re.escape(label)}"
            r"\s*[:\-]\s*(.+)"
        )

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:
            return match.group(1).strip()

    return None


def extract_structured_data(
    text: str,
    document_type: str
) -> Dict[str, Any]:
    """Extract basic structured fields from medical documents."""

    if document_type != "medical_report":
        return {}

    return {
        "diagnosis": _find_value(
            text,
            ["diagnosis"]
        ),
        "symptoms": _find_value(
            text,
            ["symptoms", "symptom"]
        ),
        "treatment": _find_value(
            text,
            ["treatment"]
        ),
        "doctor_name": _find_value(
            text,
            ["doctor", "doctor name"]
        ),
        "date": _find_value(
            text,
            ["date", "report date"]
        ),
    }


def process_document(
    file_bytes: bytes,
    filename: str,
    content_type: str
) -> Dict[str, Any]:
    """Run extraction, classification and structured extraction."""

    extension = Path(filename).suffix.lower()

    if (
        content_type == "application/pdf"
        or extension == ".pdf"
    ):
        extracted_text = extract_pdf_text(
            file_bytes
        )

    elif (
        content_type.startswith("image/")
        or extension in {
            ".jpg",
            ".jpeg",
            ".png",
        }
    ):
        extracted_text = extract_image_text(
            file_bytes
        )

    else:
        raise ValueError(
            "Unsupported document type"
        )

    document_type = classify_document(
        extracted_text,
        filename,
    )

    structured_data = extract_structured_data(
        extracted_text,
        document_type,
    )

    return {
        "extracted_text": extracted_text,
        "document_type": document_type,
        "data_json": structured_data,
    }