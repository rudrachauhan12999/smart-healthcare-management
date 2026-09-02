from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    patient_id: str
    file_name: str
    file_type: Optional[str] = None
    document_type: Optional[str] = None
    file_size: Optional[int] = None
    storage_path: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None


class DocumentDetailResponse(DocumentResponse):
    extracted_data: Optional[Dict[str, Any]] = None