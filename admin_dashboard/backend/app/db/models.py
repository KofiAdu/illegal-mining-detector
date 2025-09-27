from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

## Table
class ImageRecord(Base):
    __tablename__ = "image_records"

    id = Column(Integer, primary_key=True)
    filename = Column(String(255))
    upload_time = Column(DateTime)
    location_name = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    prediction = Column(String(255))
    confidence = Column(Float)
    image_path = Column(String(255))
    is_illegal_mining = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
