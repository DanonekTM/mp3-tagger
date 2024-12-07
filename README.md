# Tagger - A MP3 Tag Editor

A FastAPI-based backend service for editing MP3 file metadata and cover art.

## Features

- Upload MP3 files
- Read existing MP3 metadata
- Edit MP3 tags (title, artist, album, year, genre)
- Add/update cover art
- Download edited files
- Automatic file cleanup

## Prerequisites

- Python 3.8+
- pip
- virtualenv (recommended)

## Installation

1. Create and activate virtual environment:
```bash
python -m venv venv

# On Windows
venv\Scripts\activate
# On Unix or MacOS
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Project Structure

```
tagger/
├── main.py              # Main FastAPI application
├── infra/               # Terraform infrastructure
├── uploads/             # Directory for uploaded MP3 files
├── output/              # Directory for processed MP3 files
├── requirements.txt     # Python dependencies
├── docker-compose.yml   # Docker compose
├── Dockerfile.backend   # Backend dockerfile
├── Dockerfile.frontend  # Frontend dockerfile
└── frontend/            # Frontend files
```

## API Endpoints

### Upload MP3 File
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (MP3 file)
Returns: { "file_id": string, "tags": object }
```

### Save Tags and Cover
```
POST /api/save-tags/{file_id}
Content-Type: multipart/form-data
Body: 
- title (optional)
- artist (optional)
- album (optional)
- year (optional)
- genre (optional)
- cover (optional, image file)
Returns: { "tagged_file_id": string }
```

### Download Tagged File
```
GET /api/download/{tagged_file_id}
Returns: MP3 file
```

### Cleanup Files
```
DELETE /api/cleanup/{file_id}
Returns: { "status": string }
```

## Running the Server

### Development
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Docker Compose
```bash
# Build and start services
docker compose build
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Development


### Testing API Endpoints
You can test the API endpoints using the auto-generated Swagger documentation at:
```
http://<ENDPOINT>/docs
```

## Error Handling

The API includes error handling for:
- Invalid file types
- Missing files
- Processing errors
- File system errors

Error responses follow the format:
```json
{
    "detail": "Error message"
}
```

## Security Considerations

- The server accepts only MP3 files
- Files are stored with unique IDs to prevent conflicts
- Automatic file cleanup on schedule
- Running this application behind a proxy such as NGINX
- Consider implementing authentication for production use