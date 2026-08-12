import os
import uuid
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from app.core.config import settings

# Configure Cloudinary if credentials are provided
cloudinary_configured = False
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    cloudinary_configured = True

def upload_watch_image(file: UploadFile) -> str:
    """
    Uploads a watch image. If Cloudinary is configured, uploads there and returns the URL.
    Otherwise, saves it locally and returns a static file path.
    """
    # 1. Validate File Type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image format. Only JPEG, PNG, and WEBP are supported. Got: {file.content_type}"
        )

    # 2. Validate File Size (Max 5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds the maximum limit of 5MB. Got: {file_size / (1024 * 1024):.2f}MB"
        )

    if cloudinary_configured:
        try:
            # Upload with standard options (compression, resizing, etc.)
            result = cloudinary.uploader.upload(
                file.file,
                folder="luxury_watches",
                resource_type="image",
                transformation=[
                    {"width": 600, "height": 600, "crop": "limit"},
                    {"quality": "auto:eco"}, # Compress aggressively to save bandwidth and speed up load times
                    {"fetch_format": "auto"}
                ]
            )
            return result.get("secure_url")
        except Exception as e:
            # If Cloudinary upload fails, fallback to local
            print(f"Cloudinary upload failed: {e}. Falling back to local storage.")
            pass

    # Local Fallback
    upload_dir = "static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())
        
    return f"/static/uploads/{unique_filename}"

def delete_watch_image(image_url: str) -> bool:
    """
    Deletes an image. Handles both Cloudinary and local files.
    """
    if not image_url:
        return False

    if "cloudinary.com" in image_url:
        if not cloudinary_configured:
            print("Cloudinary is not configured. Cannot delete remote Cloudinary image.")
            return False
        try:
            # Extract public_id from url
            # Example: https://res.cloudinary.com/cloud/image/upload/v1723456/luxury_watches/file.jpg -> luxury_watches/file
            clean_url = image_url.split("?")[0]
            parts = clean_url.split("/")
            
            if "upload" in parts:
                upload_idx = parts.index("upload")
                sub_parts = parts[upload_idx + 1:]
                
                filtered_parts = []
                for p in sub_parts:
                    # Skip version strings (e.g. v1723456)
                    if p.startswith("v") and p[1:].isdigit():
                        continue
                    # Skip transformation parameters (e.g. w_600, h_600, c_limit, q_auto:eco)
                    if "," in p or "=" in p or p.startswith("c_") or p.startswith("w_") or p.startswith("q_") or p.startswith("f_"):
                        continue
                    filtered_parts.append(p)
                
                if filtered_parts:
                    full_id_with_ext = "/".join(filtered_parts)
                    public_id = os.path.splitext(full_id_with_ext)[0]
                    
                    logger_msg = f"Deleting Cloudinary resource with public_id: '{public_id}'"
                    print(logger_msg)
                    
                    result = cloudinary.uploader.destroy(public_id)
                    res_status = result.get("result")
                    print(f"Cloudinary destroy response for '{public_id}': {res_status}")
                    return res_status in ["ok", "not_found"]
            
            # Fallback if upload not in parts
            filename = parts[-1].split(".")[0]
            folder = parts[-2] if len(parts) >= 2 else ""
            public_id = f"{folder}/{filename}" if folder and folder != "upload" else filename
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") in ["ok", "not_found"]
        except Exception as e:
            print(f"Cloudinary delete failed for URL '{image_url}': {e}")
            return False

    elif image_url.startswith("/static/uploads/"):
        try:
            filename = image_url.replace("/static/uploads/", "")
            file_path = os.path.join("static/uploads", filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        except Exception as e:
            print(f"Local delete failed: {e}")
            return False
            
    return False
