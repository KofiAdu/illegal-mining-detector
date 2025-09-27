from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.model.predict import predict_class 
from app.db.database import SessionLocal, engine
from app.db.models import Base, ImageRecord
from datetime import datetime
from fastapi import Query ##pagination
import os
import shutil

app = FastAPI()

##CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


##serve static images
##this link allows to view single individual uploaded images
##http://localhost:8000/static/uploads/<filename>
app.mount("/static", StaticFiles(directory="app/static"), name="static")

UPLOAD_DIR = "app/static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
Base.metadata.create_all(bind=engine)


##classfidy endpoint
#@app.post("/predict")
@app.post("/classify", summary="Classify Image", response_class=JSONResponse)
async def classify_image(
    file: UploadFile = File(...),
    location_name: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...)
):
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    prediction, confidence = predict_class(file_path)

    db = SessionLocal()
    record = ImageRecord(
        filename=filename,
        upload_time=datetime.utcnow(),
        location_name=location_name,
        latitude=latitude,
        longitude=longitude,
        prediction=prediction,
        confidence=confidence,
        image_path=file_path,
        is_illegal_mining=(prediction == "Illegal-Mining")
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return JSONResponse(content={
        "id": record.id,
        "prediction": prediction,
        "confidence": confidence,
        "location": {
            "name": location_name,
            "lat": latitude,
            "lon": longitude
        }
    })

@app.get("/records")
def get_all_records(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100)):
    db = SessionLocal()
    try:
        records = db.query(ImageRecord).all()
        return [
            {
                "id": r.id,
                "filename": r.filename,
                "upload_time": r.upload_time.isoformat(),
                "location_name": r.location_name,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "prediction": r.prediction,
                "confidence": r.confidence,
                "is_illegal_mining": r.is_illegal_mining,
                "image_url": f"http://localhost:8000/static/uploads/{r.filename}"
            }
            for r in records
        ]
    finally:
        db.close()


@app.get("/records/{record_id}")
def get_record(record_id: int):
    db = SessionLocal()
    record = db.query(ImageRecord).filter(ImageRecord.id == record_id).first()
    if not record:
        return JSONResponse(status_code=404, content={"detail": "Record not found"})
    
    return {
        "id": record.id,
        "filename": record.filename,
        "prediction": record.prediction,
        "confidence": record.confidence,
        "location_name": record.location_name,
        "latitude": record.latitude,
        "longitude": record.longitude,
        "uploaded_at": record.upload_time.isoformat(),
        "is_illegal_mining": record.is_illegal_mining
    }


@app.delete("/records/{record_id}")
def delete_record(record_id: int):
    db = SessionLocal()
    record = db.query(ImageRecord).filter(ImageRecord.id == record_id).first()
    if not record:
        return JSONResponse(status_code=404, content={"detail": "Record not found"})

    db.delete(record)
    db.commit()
    return JSONResponse(content={"detail": "Record deleted"})
