# 📊 Structured Large-Scale Data Generation

An end-to-end **multimodal data generation pipeline** that collects, processes, and fuses image data using **YOLO, CLIP, and BLIP** to generate structured, high-quality datasets for model fine-tuning and evaluation.

---

## 📌 Overview

High-performing AI models depend on clean, structured, and scalable datasets. However, most web data is noisy, unstructured, and inconsistent.

This project provides an automated, modular framework that:

* Collects domain-specific image data
* Performs preprocessing and quality analysis
* Extracts object-level and semantic features
* Generates image captions
* Fuses multimodal outputs
* Produces structured, model-ready datasets

The system ensures scalability, reproducibility, and standardized benchmarking.

---

## 🎯 Problem Statement

* Web data is noisy and unstructured
* Manual dataset preparation is time-consuming
* Poor standardization across experiments
* Fragmented pipelines reduce reproducibility
* Lack of unified evaluation workflow

---

## 🚀 Proposed System

A modular end-to-end pipeline consisting of:

* Image data acquisition
* Preprocessing & quality validation
* Object detection
* Semantic embedding extraction
* Image captioning
* Multimodal feature fusion
* Structured dataset generation

---

## 🏗 System Modules

### 🔹 Module 1: Image Data Acquisition

* Domain-specific web scraping
* Public dataset integration
* Multi-source image collection
* Relevance validation
* Raw image storage

### 🔹 Module 2: Image Preprocessing & Quality Analysis

* Image resizing & normalization
* RGB format standardization
* Blur detection (Laplacian variance)
* Brightness & contrast analysis
* Metadata generation

### 🔹 Module 3: Object Detection (YOLO)

* Object localization
* Bounding box extraction
* Confidence scoring
* Structured object feature storage

### 🔹 Module 4: Semantic Feature Extraction (CLIP)

* Vision-language embeddings
* Fixed-length semantic feature vectors
* Similarity-ready representations

### 🔹 Module 5: Image Captioning (BLIP)

* Automatic image-to-text generation
* Natural language caption extraction
* Caption storage and processing

### 🔹 Module 6: Feature Fusion & Dataset Generation

* Fusion of YOLO object features, CLIP embeddings, BLIP captions, and image metadata
* Unified structured schema generation
* Large-scale dataset export for training & benchmarking

---

## ✨ Key Features

* Automated domain-specific scraping
* Noise and duplicate removal
* Multimodal feature extraction
* Structured dataset schema creation
* Model fine-tuning support
* Standardized benchmarking
* REST API integration using FastAPI
* API testing using Postman
* Scalable and modular architecture

---

## 🛠 Tech Stack

* Python
* FastAPI
* Postman
* YOLO
* CLIP
* BLIP
* PyTorch
* OpenCV
* NumPy
* Pandas

---

## 🌐 API Integration

The pipeline is deployed using **FastAPI**, enabling:

* Dataset generation through REST endpoints
* Modular execution of pipeline stages
* Scalable backend deployment

API testing and validation are performed using **Postman**.

---

## 🚀 How to Run

### 1️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 2️⃣ Configure

* **MongoDB** running on `mongodb://localhost:27017` (override with `MONGO_URI`). Data is stored in `db_final.medicinal_images`; the 146 records in `Data/Output/neem` are imported on first start.
* **Classifier weights:** place the trained YOLOv8 classifier at `Backend/yolov8_cls_best.pt` (or set `YOLO_CLS_WEIGHTS`). Without it YOLO does not vote and every image is flagged.
* **Hosted models (optional but recommended):** create `Backend/.env.local` (git-ignored) with
  ```
  NVIDIA_API_KEY=your-key
  ```
  This enables VLM image annotation, the VLM tiebreaker for flagged images, and the dataset chatbot. Override models with `NVIDIA_VLM_MODEL` / `NVIDIA_CHAT_MODEL`.

### 3️⃣ Run the Backend
```bash
cd Backend
uvicorn main:app --reload
```
API docs: `http://127.0.0.1:8000/docs`

### 4️⃣ Run the Frontend
```bash
cd Frontend
npm install
npm run dev
```
If the backend is not on port 8000, create `Frontend/.env.local` with `VITE_API_URL=http://127.0.0.1:<port>`.

### 5️⃣ Using the App

* **/analyze** – upload an image: YOLO + CLIP + BLIP vote, low-quality images are enhanced and retried, and a hosted VLM annotates the image and breaks ties.
* **/search** – browse, filter and export (JSON/CSV) the structured dataset.
* **/review** – confirm or correct the label of flagged images.
* **/chat** – ask questions about the dataset in plain English.
* **/dashboard** – dataset and pipeline overview.

---

## 📂 Output

Generated structured datasets are stored in:
Each record includes:

* Object detection features
* Semantic embeddings
* Image captions
* Metadata
* Quality metrics

---

## 📈 Applications

* Vision-language model fine-tuning
* Dataset benchmarking
* Multimodal AI research
* LLM training pipelines
* Standardized model comparison

---

## 🔮 Future Enhancements

* Distributed large-scale processing
* Interactive analytics dashboard
* HuggingFace dataset integration
* Real-time dataset quality scoring
* Cloud deployment support

---

## 📄 License

This project is developed for academic and research purposes.

