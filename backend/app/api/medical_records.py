
from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.services.supabase_service import get_supabase_client


router = APIRouter(
    prefix="/api/patients",
    tags=["Medical Records"],
)


@router.get("/{patient_id}/medical-records")
def get_medical_records(patient_id: UUID):
    try:
        supabase = get_supabase_client()

        patient_response = (
            supabase.table("patients")
            .select("id")
            .eq("id", str(patient_id))
            .maybe_single()
            .execute()
        )

        if not patient_response.data:
            raise HTTPException(
                status_code=404,
                detail="Patient not found",
            )

        response = (
            supabase.table("medical_records")
            .select(
                "id, patient_id, doctor_id, diagnosis, symptoms, "
                "treatment, notes, visit_date"
            )
            .eq("patient_id", str(patient_id))
            .order("visit_date", desc=True)
            .execute()
        )

        return {"records": response.data or []}

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve medical records",
        )
