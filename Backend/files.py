import os
import json
import uuid
from datetime import datetime
from typing import List, Optional
from types import SimpleNamespace
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from security import verify_jwt

files_router = APIRouter(prefix="/api/files", tags=["files"])

# Base directory for storing uploads locally
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
METADATA_FILE = os.path.join(UPLOAD_DIR, "metadata.json")

os.makedirs(UPLOAD_DIR, exist_ok=True)


def load_metadata() -> List[dict]:
    if not os.path.exists(METADATA_FILE):
        return []
    try:
        with open(METADATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading file metadata: {e}")
        return []


def save_metadata(data: List[dict]):
    try:
        with open(METADATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving file metadata: {e}")


@files_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    description: Optional[str] = Form(""),
    user: SimpleNamespace = Depends(verify_jwt),
):
    try:
        file_id = str(uuid.uuid4())
        safe_filename = f"{file_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        # Read content and save locally
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        uploader_email = getattr(user, "email", "Unknown User")
        uploader_id = getattr(user, "id", "unknown")

        metadata_entry = {
            "id": file_id,
            "filename": safe_filename,
            "original_name": file.filename,
            "content_type": file.content_type or "application/octet-stream",
            "size": len(content),
            "description": description or "",
            "uploader_id": uploader_id,
            "uploader_email": uploader_email,
            "created_at": datetime.now().isoformat(),
        }

        all_metadata = load_metadata()
        all_metadata.insert(0, metadata_entry)
        save_metadata(all_metadata)

        return {
            "status": "Success",
            "message": "File uploaded successfully",
            "file": metadata_entry,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}",
        )


@files_router.get("/list")
def list_files(user: SimpleNamespace = Depends(verify_jwt)):
    files = load_metadata()
    return {
        "status": "Success",
        "count": len(files),
        "files": files,
    }


@files_router.get("/download/{file_id}")
def download_file(file_id: str, user: SimpleNamespace = Depends(verify_jwt)):
    files = load_metadata()
    target = next((f for f in files if f["id"] == file_id), None)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    file_path = os.path.join(UPLOAD_DIR, target["filename"])
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File content missing on server",
        )

    return FileResponse(
        path=file_path,
        filename=target["original_name"],
        media_type=target["content_type"],
    )


@files_router.delete("/{file_id}")
def delete_file(file_id: str, user: SimpleNamespace = Depends(verify_jwt)):
    files = load_metadata()
    target = next((f for f in files if f["id"] == file_id), None)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    uploader_id = getattr(user, "id", "")
    # Allow uploader or admin to delete file
    if target["uploader_id"] != uploader_id:
        from security import RoleChecker
        # We can check if user is admin
        from main import supabase_admin
        user_role = "student"
        try:
            res = supabase_admin.schema("ai_student").table("users").select("role").eq("id", uploader_id).execute()
            if res.data and len(res.data) > 0:
                user_role = res.data[0].get("role", "student")
        except Exception:
            pass
        if user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this file",
            )

    # Remove physical file
    file_path = os.path.join(UPLOAD_DIR, target["filename"])
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Failed to remove file from disk: {e}")

    # Remove metadata
    updated_files = [f for f in files if f["id"] != file_id]
    save_metadata(updated_files)

    return {
        "status": "Success",
        "message": "File deleted successfully",
    }
