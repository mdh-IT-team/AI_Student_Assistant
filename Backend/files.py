import os
import json
import uuid
from datetime import datetime
from typing import List, Optional
from types import SimpleNamespace
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response, status
from fastapi.responses import FileResponse
from security import verify_jwt

files_router = APIRouter(prefix="/api/files", tags=["files"])

# Base directory for local fallback storage
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
METADATA_FILE = os.path.join(UPLOAD_DIR, "metadata.json")
os.makedirs(UPLOAD_DIR, exist_ok=True)

SUPABASE_BUCKET = "materials"


def get_supabase_admin():
    try:
        from main import supabase_admin
        return supabase_admin
    except Exception as e:
        print(f"Failed to import supabase_admin: {e}")
        return None


def load_local_metadata() -> List[dict]:
    if not os.path.exists(METADATA_FILE):
        return []
    try:
        with open(METADATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_local_metadata(data: List[dict]):
    try:
        with open(METADATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving local metadata: {e}")


@files_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    description: Optional[str] = Form(""),
    module_id: Optional[str] = Form(None),
    user: SimpleNamespace = Depends(verify_jwt),
):
    try:
        file_id = str(uuid.uuid4())
        uploader_id = getattr(user, "id", "unknown")
        uploader_email = getattr(user, "email", "Unknown User")
        content = await file.read()
        content_type = file.content_type or "application/octet-stream"

        supabase_admin = get_supabase_admin()
        storage_path = f"{uploader_id}/{file_id}_{file.filename}"
        used_supabase = False

        if supabase_admin:
            try:
                # 1. Upload file binary to Supabase Storage bucket 'materials'
                supabase_admin.storage.from_(SUPABASE_BUCKET).upload(
                    path=storage_path,
                    file=content,
                    file_options={"content-type": content_type, "upsert": "true"}
                )

                # 2. Insert metadata record into Supabase Database table ai_student.materials
                db_payload = {
                    "id": file_id,
                    "user_id": uploader_id,
                    "module_id": module_id,
                    "file_name": file.filename,
                    "file_type": content_type,
                    "storage_path": storage_path,
                    "file_size": len(content),
                    "created_at": datetime.now().isoformat(),
                }
                supabase_admin.schema("ai_student").table("materials").insert(db_payload).execute()
                used_supabase = True
            except Exception as sb_err:
                print(f"Supabase upload/db insert warning (falling back to local storage): {sb_err}")

        # Fallback to local storage if Supabase upload failed or not connected
        if not used_supabase:
            safe_filename = f"{file_id}_{file.filename}"
            local_path = os.path.join(UPLOAD_DIR, safe_filename)
            with open(local_path, "wb") as f:
                f.write(content)

            metadata_entry = {
                "id": file_id,
                "filename": safe_filename,
                "original_name": file.filename,
                "content_type": content_type,
                "size": len(content),
                "description": description or "",
                "uploader_id": uploader_id,
                "uploader_email": uploader_email,
                "storage_path": safe_filename,
                "created_at": datetime.now().isoformat(),
            }
            all_meta = load_local_metadata()
            all_meta.insert(0, metadata_entry)
            save_local_metadata(all_meta)

        return {
            "status": "Success",
            "message": "File uploaded successfully to Supabase Database & Storage" if used_supabase else "File uploaded locally",
            "file": {
                "id": file_id,
                "original_name": file.filename,
                "content_type": content_type,
                "size": len(content),
                "description": description or "",
                "uploader_email": uploader_email,
                "created_at": datetime.now().isoformat(),
                "storage_type": "Supabase" if used_supabase else "Local",
            },
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}",
        )


@files_router.get("/list")
def list_files(user: SimpleNamespace = Depends(verify_jwt)):
    supabase_admin = get_supabase_admin()
    if supabase_admin:
        try:
            # Query Supabase PostgreSQL table ai_student.materials
            res = supabase_admin.schema("ai_student").table("materials").select("*").order("created_at", desc=True).execute()
            if res.data is not None:
                # Format files for frontend consumption
                files_list = []
                for item in res.data:
                    files_list.append({
                        "id": item.get("id"),
                        "original_name": item.get("file_name") or item.get("original_name") or "File",
                        "content_type": item.get("file_type") or "application/octet-stream",
                        "size": item.get("file_size") or 0,
                        "description": item.get("description") or "",
                        "uploader_id": item.get("user_id"),
                        "uploader_email": item.get("uploader_email") or f"User {item.get('user_id', '')[:8]}",
                        "created_at": item.get("created_at"),
                        "storage_path": item.get("storage_path"),
                        "storage_type": "Supabase",
                    })
                return {
                    "status": "Success",
                    "count": len(files_list),
                    "files": files_list,
                }
        except Exception as sb_err:
            print(f"Supabase list files warning (falling back to local): {sb_err}")

    # Local fallback
    local_files = load_local_metadata()
    return {
        "status": "Success",
        "count": len(local_files),
        "files": local_files,
    }


@files_router.get("/download/{file_id}")
def download_file(file_id: str, user: SimpleNamespace = Depends(verify_jwt)):
    supabase_admin = get_supabase_admin()
    if supabase_admin:
        try:
            # 1. Fetch file record from Supabase DB ai_student.materials
            res = supabase_admin.schema("ai_student").table("materials").select("*").eq("id", file_id).execute()
            if res.data and len(res.data) > 0:
                record = res.data[0]
                storage_path = record.get("storage_path")
                file_name = record.get("file_name") or "downloaded_file"
                content_type = record.get("file_type") or "application/octet-stream"

                # 2. Download file binary directly from Supabase Storage
                file_bytes = supabase_admin.storage.from_(SUPABASE_BUCKET).download(storage_path)
                return Response(
                    content=file_bytes,
                    media_type=content_type,
                    headers={"Content-Disposition": f'attachment; filename="{file_name}"'}
                )
        except Exception as sb_err:
            print(f"Supabase download warning (falling back to local): {sb_err}")

    # Fallback to local files
    local_files = load_local_metadata()
    target = next((f for f in local_files if f["id"] == file_id), None)
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
        filename=target.get("original_name", "file"),
        media_type=target.get("content_type", "application/octet-stream"),
    )


@files_router.delete("/{file_id}")
def delete_file(file_id: str, user: SimpleNamespace = Depends(verify_jwt)):
    uploader_id = getattr(user, "id", "")
    supabase_admin = get_supabase_admin()

    if supabase_admin:
        try:
            # 1. Fetch metadata record from Supabase DB ai_student.materials
            res = supabase_admin.schema("ai_student").table("materials").select("*").eq("id", file_id).execute()
            if res.data and len(res.data) > 0:
                record = res.data[0]
                # Permission check: owner or admin
                if record.get("user_id") != uploader_id:
                    user_role = "student"
                    try:
                        role_res = supabase_admin.schema("ai_student").table("users").select("role").eq("id", uploader_id).execute()
                        if role_res.data and len(role_res.data) > 0:
                            user_role = role_res.data[0].get("role", "student")
                    except Exception:
                        pass
                    if user_role != "admin":
                        raise HTTPException(
                            status_code=status.HTTP_403_FORBIDDEN,
                            detail="You do not have permission to delete this file",
                        )

                # 2. Remove file from Supabase Storage
                if record.get("storage_path"):
                    try:
                        supabase_admin.storage.from_(SUPABASE_BUCKET).remove([record.get("storage_path")])
                    except Exception as st_err:
                        print(f"Supabase storage remove warning: {st_err}")

                # 3. Delete metadata record from Supabase DB table ai_student.materials
                supabase_admin.schema("ai_student").table("materials").delete().eq("id", file_id).execute()
                return {
                    "status": "Success",
                    "message": "File deleted from Supabase Storage & Database",
                }
        except HTTPException:
            raise
        except Exception as sb_err:
            print(f"Supabase delete warning (falling back to local): {sb_err}")

    # Fallback delete for local storage
    local_files = load_local_metadata()
    target = next((f for f in local_files if f["id"] == file_id), None)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    file_path = os.path.join(UPLOAD_DIR, target["filename"])
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass

    updated_files = [f for f in local_files if f["id"] != file_id]
    save_local_metadata(updated_files)

    return {
        "status": "Success",
        "message": "File deleted successfully",
    }
