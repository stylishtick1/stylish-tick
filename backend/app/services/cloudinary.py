import os
import uuid
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
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
    if "cloudinary.com" in image_url:
        try:
            # Extract public_id from url
            # Example: https://res.cloudinary.com/.../luxury_watches/file.jpg -> luxury_watches/file
            parts = image_url.split("/")
            version_idx = -1
            for idx, part in enumerate(parts):
                if part.startswith("v") and part[1:].isdigit():
                    version_idx = idx
                    break
            
            if version_idx != -1:
                public_id_parts = parts[version_idx + 1:]
            else:
                # Fallback if no version string
                public_id_parts = parts[-2:]
                
            public_id = "/".join(public_id_parts).split(".")[0]
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") == "ok"
        except Exception as e:
            print(f"Cloudinary delete failed: {e}")
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
