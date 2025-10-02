# Illegal Mining Detection System

Detect and monitor illegal mining activities from satellite imagery using deep learning and geospatial analysis.

[Watch Demo on YouTube](https://youtu.be/GOniCObQs1k)
---

##  Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Limitations](#limitations)
- [Next Steps](#next-steps)

---

## Overview

This project is a full-stack system for detecting illegal mining activities using satellite imagery. It uses deep learning to identify land-use changes that may indicate environmental violations.
The backend uses a ResNet18-based CNN model to classify land cover types with high accuracy. 
The frontend is an interactive dashboard built with React and Mapbox, allowing users to upload images, visualize detections, and explore data on a map.
The system supports real-time logging to a MySQL database and is designed to assist environmental agencies, researchers, or policy teams in monitoring land changes over time.

---

## Features

-  CNN-based land classification (ResNet18)
-  Interactive map-based dashboard (React + Mapbox)
-  FastAPI backend for inference & data logging
-  MySQL database for audit trails

---

## Tech Stack

- **Frontend:** React, TypeScript, Mapbox
- **Backend:** FastAPI, SQLAlchemy
- **Model:** Pytorch, Remote Sensing
- **Database:** MySQL
- **Deployment:** Docker

---

## Project Structure

```
mining-project/
├── admin_dashboard/           # Admin dashboard application
│   ├── backend/               # Backend for admin dashboard (if used)
│   └── frontend/              # React-based frontend dashboard (Mapbox, UI)
│
├── classes/                   # Image classification folders (e.g. Forest, Beach, etc.)
│
├── data/                      # Dataset split for model training
│   ├── train/                 # Training images
│   └── val/                   # Validation images
│
├── models/                    # Saved model weights (e.g. .pt files)
│
├── qgis scripts/              # Python scripts for QGIS integration and screenshots
│
├── results/                   # CSV results, logs, and predictions
│
├── test-images/               # Images used for testing/inference
│
├── dataset.py                 # Custom dataset class for loading image data
├── docker.md                  # Docker setup notes
├── model.py                   # ResNet18 model architecture and training code
├── run_train.ipynb            # Notebook to train the model
├── split_data.ipynb           # Script to split data into train/val sets
├── train.py                   # Main training script (CLI)
│
├── requirements.txt           # Python dependencies
├── .gitignore                 # Git ignored files and folders
└── README.md                  # Project documentation

```

---
## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/KofiAdu/illegal-mining-detector.git
cd illegal-mining-detector
```

### 2. Prepare Data or Use Pretrained Model

You have two options:

#### Option A: Train the Model Yourself

- Download the `classes` folder from the provided [Google Drive link](https://drive.google.com/drive/folders/1WkCVvoi5npAKYcpzHBvEf4L0Ndvls89j?usp=drive_link).
- Run the notebook `split_data.ipynb` to split the data into `train` and `val` folders (approx. 2.7 GB of images).
- Then, either train using `run_train.ipynb` or `train.py`.

#### Option B: Use Pretrained Model

- Download the trained model from the [Google Drive link](https://drive.google.com/file/d/19F7t12v11d28Jm69ECbAdsVQuCRNuAOf/view?usp=drive_link).
- Place the model file inside:  
  `backend/app/model/`

> If using the pretrained model, you can skip directly to the backend setup.

---

## Backend (FastAPI)

This project uses FastAPI to serve the model.

### Option 1: Run Locally

```bash
cd admin_dashboard/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Option 2: Run with Docker (Recommended)

```bash
cd admin_dashboard/backend
docker-compose up --build
```

---

## Frontend (React)

The frontend is located in `admin_dashboard/frontend`.

```bash
cd admin_dashboard/frontend
npm install
npm run dev
```

This will start the development server at [http://localhost:5173](http://localhost:5173).

---

## Usage

1. Upload satellite imagery via the dashboard, along with the site name and its coordinates(all required inputs).
2. The backend processes the image, classifies land use, and detects potential illegal mining activity.
3. The results are logged automatically with a timestamp and location metadata.
4. Predictions are visualized on an interactive map for easy monitoring and review.

---

## Demo

> _[Watch Demo on YouTube](https://youtu.be/GOniCObQs1k)_

---

## Limitations

- **Confusion in visually similar classes**  
  The model struggles to distinguish between land types with similar visual features (e.g., *bareland* vs *mining*, or *desert* vs *mountains*).
- **Requires preprocessed image inputs**  
  Only accepts `.jpg`, `.jpeg`, or `.png` files. Raw satellite formats like **GeoTIFF** are not supported.
- **No vegetation index analysis (NDVI/NDWI)**  
  NDVI and NDWI calculations are not implemented, limiting ecological insights.
- **Manual coordinate entry**  
  Since input images don’t contain embedded metadata (like GeoTIFFs), users must manually input location data during uploads.
- **No multi-temporal analysis**  
  The system does not support comparisons over time to monitor changes or trends in land use.

---

## Next Steps

- **Full pipeline automation**  
  Develop a system that automatically handles everything from satellite image ingestion to prediction, logging, and dashboard display without manual input.
- **Model retraining with GeoTIFF data**  
  Rebuild the model using multi-band spectral data such as NIR and SWIR to improve accuracy in identifying land-use patterns and illegal mining.
- **NDVI and NDWI integration**  
  Add vegetation and water index calculations as part of the model’s input features to enhance its ability to detect environmental changes.
- **Real-time satellite monitoring**  
  Integrate with platforms like Sentinel Hub or Google Earth Engine to stream recent satellite imagery and enable live monitoring of targeted regions.
- **Automatic coordinate extraction**  
  Use embedded metadata from GeoTIFF files to automatically capture coordinates and timestamps, reducing manual input and human error.
- **Support for temporal analysis**  
  Allow users to compare imagery across time to detect changes and trends in land use or mining activity.
- **Better user interface**  
  Improve the dashboard experience with validation, image previews, filters, and historical browsing by location or date.
---


