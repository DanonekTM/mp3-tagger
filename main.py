from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import shutil
import os
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, TIT2, TPE1, TALB, TDRC, TCON, APIC
from pathlib import Path
import uuid

app = FastAPI()

# Configure upload and output directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("output")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload an MP3 file and return its metadata
    Returns: {
        "file_id": str,
        "tags": {
            "title": str,
            "artist": str,
            "album": str,
            "year": str,
            "genre": str
        }
    }
    """
    if not file.filename.lower().endswith('.mp3'):
        raise HTTPException(400, "Only MP3 files are supported")
    
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}.mp3"
    
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Read existing tags
        audio = MP3(file_path, ID3=ID3)
        tags = {
            "title": str(audio.get("TIT2", "")),
            "artist": str(audio.get("TPE1", "")),
            "album": str(audio.get("TALB", "")),
            "year": str(audio.get("TDRC", "")),
            "genre": str(audio.get("TCON", ""))
        }
        
        return {"file_id": file_id, "tags": tags}
    
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(500, str(e))

@app.post("/save-tags/{file_id}")
async def save_tags(
    file_id: str,
    title: str = Form(None),
    artist: str = Form(None),
    album: str = Form(None),
    year: str = Form(None),
    genre: str = Form(None),
    cover: UploadFile = File(None)
):
    """
    Save tags and cover image to the MP3 file
    Returns: {"tagged_file_id": str}
    """
    input_path = UPLOAD_DIR / f"{file_id}.mp3"
    if not input_path.exists():
        raise HTTPException(404, "File not found")
    
    # Create output file with _tagged suffix
    output_path = OUTPUT_DIR / f"{file_id}_tagged.mp3"
    shutil.copy2(input_path, output_path)
    
    try:
        audio = MP3(output_path, ID3=ID3)
        
        # Create ID3 tag if it doesn't exist
        if audio.tags is None:
            audio.add_tags()
        
        # Update the tags
        if title:
            audio.tags.add(TIT2(encoding=3, text=title))
        if artist:
            audio.tags.add(TPE1(encoding=3, text=artist))
        if album:
            audio.tags.add(TALB(encoding=3, text=album))
        if year:
            audio.tags.add(TDRC(encoding=3, text=year))
        if genre:
            audio.tags.add(TCON(encoding=3, text=genre))
            
        # Add cover image if provided
        if cover:
            image_data = await cover.read()
            audio.tags.add(
                APIC(
                    encoding=3,
                    mime=cover.content_type,
                    type=3,  # Cover image
                    desc='Cover',
                    data=image_data
                )
            )
        
        audio.save()
        return {"tagged_file_id": f"{file_id}_tagged"}
    
    except Exception as e:
        if output_path.exists():
            output_path.unlink()
        raise HTTPException(500, str(e))

@app.get("/download/{tagged_file_id}")
async def download_file(tagged_file_id: str):
    """
    Download the tagged MP3 file
    Returns: FileResponse with the MP3 file
    """
    file_path = OUTPUT_DIR / f"{tagged_file_id}.mp3"
    if not file_path.exists():
        raise HTTPException(404, "Tagged file not found")
    
    return FileResponse(
        file_path,
        media_type="audio/mpeg",
        filename=f"{tagged_file_id}.mp3"
    )

@app.delete("/cleanup/{file_id}")
async def cleanup_files(file_id: str):
    """
    Clean up uploaded and tagged files
    """
    input_path = UPLOAD_DIR / f"{file_id}.mp3"
    output_path = OUTPUT_DIR / f"{file_id}_tagged.mp3"
    
    if input_path.exists():
        input_path.unlink()
    if output_path.exists():
        output_path.unlink()
    
    return {"status": "cleaned"}
