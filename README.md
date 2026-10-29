# 📊 Structured Large-Scale Data Generation

A multimodal pipeline that turns raw **medicinal-plant photos** (currently **neem** and **tulasi / holy basil**) into a **clean, structured, searchable dataset** that is ready for model fine-tuning and evaluation.

Several AI models look at every image and vote on what plant it is. Images the models agree on are accepted automatically. Images they disagree on are flagged for a human to review. A hosted vision-language model describes each image in detail and helps break ties, and a built-in chatbot lets anyone ask questions about the dataset in plain English.

---

## Table of Contents

1. [What problem this solves](#-what-problem-this-solves)
2. [How it works (the short version)](#-how-it-works-the-short-version)
3. [Features](#-features)
4. [The AI chatbot](#-the-ai-chatbot)
5. [How an image is analysed (step by step)](#-how-an-image-is-analysed-step-by-step)
6. [What gets stored for each image](#-what-gets-stored-for-each-image)
7. [Setup and installation](#-setup-and-installation)
8. [Environment variables and API keys](#-environment-variables-and-api-keys)
9. [Running the application](#-running-the-application)
10. [Using the application](#-using-the-application)
11. [API reference](#-api-reference)
12. [Training the plant classifier](#-training-the-plant-classifier)
13. [Privacy and security](#-privacy-and-security)
14. [Known limitations](#-known-limitations)
15. [Troubleshooting](#-troubleshooting)
16. [Project structure](#-project-structure)
17. [Tech stack](#-tech-stack)

---

## 🎯 What problem this solves

High-performing AI models depend on clean, structured, correctly labelled data. Raw image collections are noisy: images are blurry, mislabelled, duplicated or unrelated, and preparing them by hand is slow and inconsistent.

This project automates the preparation:

* It measures **image quality** (sharpness, brightness, contrast).
* It **identifies the plant** using three independent AI models and checks whether they agree.
* It **enhances** poor-quality images and tries again before giving up.
* It **describes** each image in structured form (species, leaf condition, visible parts).
* It routes uncertain images to a **human review queue**, so the final dataset is trustworthy.
* It lets you **search, filter and export** the result as JSON or CSV.

---

## 🧭 How it works (the short version)

```
                    ┌─────────────────────────────────────────────┐
   Upload image ──▶ │  Backend (FastAPI, Python)                  │
                    │                                             │
                    │  1. Quality check  (blur, brightness, contrast)
                    │  2. Three local models vote on the plant:   │
                    │       YOLO classifier · CLIP · BLIP         │
                    │  3. Poor quality or disagreement?           │
                    │       → enhance the image and retry (max 2) │
                    │  4. Hosted vision-language model (NVIDIA)   │
                    │       → structured description + tiebreaker │
                    │  5. Result: Accepted  or  Flagged for review│
                    └───────────────┬─────────────────────────────┘
                                    │ saved to
                                    ▼
                          MongoDB (db_final)
                                    ▲
                                    │ read by
        ┌───────────────────────────┴───────────────────────────┐
        │ Frontend (React): Analyze · Search · Review · Chat ·  │
        │ Dashboard                                             │
        └────────────────────────────────────────────────────────┘
```

The three local models run on the machine that hosts the backend. The hosted model and the chatbot call NVIDIA's API and need an API key (see [Environment variables](#-environment-variables-and-api-keys)). **Everything still works without the key**, except the VLM annotation and the chatbot.

---

## ✨ Features

### 1. Image analysis (`/analyze`)
Upload a photo and get back, within a few seconds:
* **The plant** (neem or tulasi) and whether the result was **Accepted** or **Flagged for review**.
* **The model votes**: what each of YOLO, CLIP and BLIP said, with confidence scores.
* **Quality metrics**: sharpness, brightness and contrast.
* **How many enhancement retries** were needed (the system automatically sharpens, brightens or raises the contrast of poor images and tries again).
* **The hosted VLM annotation**: species, confidence, leaf condition (healthy, diseased, dry, damaged), visible parts, and a one-sentence note.
* **A caption** describing the image.

### 2. Search and browse (`/search`)
Browse every image in the dataset with a thumbnail, caption, quality metrics and model confidences.
* **Free-text search** across file names, captions and plant names.
* **Filters:** plant (neem / tulasi), source (original dataset / uploaded by a user), status (Imported / Accepted / Flagged / Reviewed).
* **Sort** by newest, sharpest, or YOLO confidence.
* **Paging** for large result sets.
* **Export** the current selection as **JSON** or **CSV** with one click (see below).

### 3. Review queue (`/review`)
Images the models could not agree on land here. For each one you see the image, the votes of every model, and the hosted VLM's opinion. You then click **Neem**, **Tulasi** or **Other** to record the correct label.
* The human decision becomes the image's label and its status becomes **Reviewed**.
* The model's original prediction is **kept** (as `model_label`), so you can measure how often the models were wrong.

### 4. Dataset export (the "structured dataset" itself)
From the Search page, export the images matching your current filters:
* **JSON**: full structured records (embeddings are excluded by default to keep files small; add `include_embeddings=true` to the API call to include them).
* **CSV**: one row per image with label, original model label, status, caption, quality metrics, confidences, and the VLM's species, leaf condition and notes.

Typical use: filter to **Accepted + Reviewed** images and export them as your clean training set.

### 5. Dashboard (`/dashboard`)
A live overview: total images, how many were uploaded and analysed, how many were accepted or flagged, a breakdown by plant, status and source, average image quality, the most recent images, and a summary of the three models in the pipeline.

### 6. AI chatbot (`/chat`)
Ask questions about the dataset in plain English. See the [next section](#-the-ai-chatbot).

---

## 🤖 The AI chatbot

**What it is:** a chat page where you type a normal question about the dataset and get a short, factual answer plus thumbnails of the images it found.

**Example questions**
* "How many images are in the dataset?"
* "Show the sharpest flagged images."
* "Which of my uploads were accepted?"
* "How many tulasi images are there?"

**How it works (three steps)**
1. **Understand the question.** A hosted language model converts your question into a small structured filter (for example: *search, flagged, sorted by sharpness*).
2. **Run a real query.** The backend checks that filter against a strict allow-list, then runs it against the database. Only fixed, read-only queries are possible.
3. **Write the answer.** The language model is given the real results (counts and a few records) and writes a short answer using only that data.

**Why this design is safe and trustworthy**
* The language model **never touches the database directly** and cannot change or delete anything. Its output is treated as untrusted and validated before use.
* Answers are based on **real query results**, not on the model's memory, and the thumbnails shown let you verify them.
* Text inside captions or file names is treated as data, never as instructions.

**What it can't do:** it cannot edit records, retrain models, or answer questions about anything other than the dataset. It needs the `NVIDIA_API_KEY` to work.

---

## 🔬 How an image is analysed (step by step)

1. **Quality measurement.** Sharpness (Laplacian variance), brightness and contrast are computed.
2. **Three local models vote** on the plant:
   * **YOLO classifier**: a YOLOv8 model trained by this project to tell neem from tulasi (about **98.9% validation accuracy** on the training run).
   * **CLIP** (ViT-B/32): compares the image with the text "a photo of a neem leaf" / "a photo of a tulasi leaf".
   * **BLIP**: writes a caption; if the caption names a plant, that counts as a vote. Captions often don't, so BLIP frequently abstains.
3. **Decision rules.** An image is **Accepted** when either:
   * all three models agree and YOLO and CLIP are each at least 75% confident, **or**
   * two of three agree, YOLO is one of them, and YOLO is at least 80% confident.
4. **Self-correction loop.** If the image is not accepted, the system enhances it and tries again, up to **2 retries**:
   * low contrast → local contrast enhancement (CLAHE)
   * blurry → sharpening
   * dark → brightness (gamma) correction
5. **Hosted VLM annotation.** A vision-language model (NVIDIA API) describes the image as structured data: species, confidence, leaf condition, visible parts and a note.
6. **VLM tiebreaker.** If the image would be **flagged** but the VLM names the same plant as the local models' consensus with at least 70% confidence, the image is **Accepted** and marked as confirmed by the VLM. Otherwise it is **Flagged for review**, with the VLM's opinion shown to the reviewer.
7. **Saved.** The result is stored in MongoDB and appears immediately in Search, Review, Chat and the Dashboard.

---

## 🗂 What gets stored for each image

Each image is one document in MongoDB (`db_final` → `medicinal_images`):

| Field | Meaning |
|---|---|
| `image_id` | File name |
| `source` | `dataset` (the original imported images) or `upload` (analysed through the app) |
| `label` | Final plant label (the model consensus, or the reviewer's choice) |
| `model_label` | The models' original label, kept after a human review |
| `status` | `Imported`, `Accepted`, `Flagged` or `Reviewed` |
| `caption` | BLIP caption |
| `quality_metrics` | `blur_score`, `brightness`, `contrast` |
| `votes`, `agreement_ratio` | What each model said and how many agreed |
| `yolo_confidence`, `clip_confidence` | Confidence scores |
| `retry_count` | How many enhancement retries were needed |
| `vlm` | Hosted VLM annotation (species, confidence, leaf condition, visible parts, notes, model name) |
| `adjudicated` | `true` if the VLM tiebreaker rescued the image |
| `clip_embedding` | 512-number CLIP vector (for similarity work and model training) |
| `image_url`, `created_at` | Where to show the image, and when it was added |

The **146 original neem images** (`Data/Output/neem/structured_dataset.json`) are imported automatically on the first start and labelled `neem` with status `Imported`.

---

## 🛠 Setup and installation

### Prerequisites

| Requirement | Notes |
|---|---|
| **Python 3.13** | Tested version. Other recent 3.x versions should work |
| **Node.js 18+** | For the frontend (tested with Node 24) |
| **MongoDB** | Running locally on the default port 27017 |
| **Trained classifier file** | `Backend/yolov8_cls_best.pt` (included in the repository) |
| **NVIDIA API key** | Optional, but needed for the VLM annotation and the chatbot |
| **Internet access on first run** | The CLIP and BLIP models download once (roughly 1–2 GB combined) and are then cached |

A GPU is **not** required. Analysis takes a few seconds per image on a normal CPU.

### Install

```bash
# 1. Backend dependencies (use a virtual environment)
cd Backend
python -m venv venv
venv\Scripts\activate          # Windows   (Linux/macOS: source venv/bin/activate)
pip install -r requirements.txt

# 2. Frontend dependencies
cd ../Frontend
npm install
```

> **Windows tip:** keep the virtual environment in a short path (for example `C:\sdgvenv`). Installing PyTorch into a deeply nested folder can fail with a "filename too long" error.

---

## 🔑 Environment variables and API keys

### Where to put them

* **Backend:** create the file `Backend/.env.local`. It is read automatically on start-up and is **git-ignored, so your key is never committed**.
* **Frontend:** create the file `Frontend/.env.local` (also git-ignored).

Never put a secret in `Backend/.env`; that file is tracked by git.

### Backend variables

| Variable | Required? | Default | Purpose |
|---|---|---|---|
| `NVIDIA_API_KEY` | **Required for the VLM annotation and the chatbot** | none | Your key from [build.nvidia.com](https://build.nvidia.com). Without it, the app still analyses images with the three local models and flags anything it is unsure about, but there are no VLM annotations or tiebreaker, and `/chat` returns an error |
| `NVIDIA_VLM_MODEL` | No | `meta/llama-3.2-11b-vision-instruct` | Vision-language model used for image annotation |
| `NVIDIA_CHAT_MODEL` | No | `openai/gpt-oss-20b` | Language model used by the chatbot |
| `NVIDIA_API_URL` | No | `https://integrate.api.nvidia.com/v1` | API endpoint (OpenAI-compatible) |
| `MONGO_URI` | No | `mongodb://localhost:27017/` | MongoDB connection string |
| `YOLO_CLS_WEIGHTS` | No | `Backend/yolov8_cls_best.pt` | Path to the trained plant classifier |

Example `Backend/.env.local`:

```
NVIDIA_API_KEY=your-nvidia-api-key
# Optional overrides:
# NVIDIA_VLM_MODEL=meta/llama-3.2-11b-vision-instruct
# NVIDIA_CHAT_MODEL=openai/gpt-oss-20b
# MONGO_URI=mongodb://localhost:27017/
```

> **Model availability:** not every model listed in NVIDIA's catalog is enabled for every account. The two defaults above were verified to work. If you change a model and requests start failing, switch back or check which models your key can use.

### Frontend variables

| Variable | Required? | Default | Purpose |
|---|---|---|---|
| `VITE_API_URL` | Only if the backend is **not** on port 8000 | `http://127.0.0.1:8000` | Address of the backend |

Example `Frontend/.env.local`:

```
VITE_API_URL=http://127.0.0.1:8000
```

### How to get an NVIDIA API key

1. Create a free account at [build.nvidia.com](https://build.nvidia.com).
2. Open any model page and choose **Get API Key** (keys start with `nvapi-`).
3. Paste it into `Backend/.env.local` as shown above and restart the backend.

---

## ▶ Running the application

Start MongoDB first, then the backend, then the frontend.

**Backend**
```bash
cd Backend
uvicorn main:app --port 8000
```
The first start takes a while because the CLIP and BLIP models load (and download on the very first run). Wait for `Application startup complete`. On a fresh database you will also see `Seeded 146 dataset records`. Interactive API documentation is at **http://127.0.0.1:8000/docs**.

**Frontend**
```bash
cd Frontend
npm run dev
```
Open **http://localhost:3000**. The app opens on the login page; Login and Signup are currently UI mock-ups, so go straight to `/search`, `/analyze`, `/review`, `/chat` or `/dashboard`.

> The backend only accepts browser requests from `http://localhost:3000` and `http://127.0.0.1:3000` (CORS). If the frontend runs on another address, add it in `Backend/main.py` (`allow_origins`).

---

## 🖥 Using the application

| Page | Address | What to do |
|---|---|---|
| Analyze | `/analyze` | Upload a plant image and read the votes, quality metrics, VLM annotation and decision |
| Search | `/search` | Search, filter, sort and export the dataset |
| Review | `/review` | Resolve flagged images by choosing the correct label |
| Chat | `/chat` | Ask questions about the dataset in plain English |
| Dashboard | `/dashboard` | See live totals and breakdowns |

**A typical workflow:** upload images in **Analyze** → check the **Review** queue and correct flagged images → filter **Search** to Accepted + Reviewed → **Export** as CSV or JSON for training → use **Chat** or the **Dashboard** for quick answers and a progress overview.

---

## 📡 API reference

All endpoints are served by the FastAPI backend (try them at `/docs`).

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/analyze-agentic` | **Main analysis endpoint.** Multipart upload (`file`). Runs the full pipeline, saves the result and returns it |
| `GET` | `/agentic-status` | Shows whether the trained classifier is loaded |
| `GET` | `/records` | Search images. Query parameters: `q`, `label`, `source`, `status`, `sort` (`newest`/`sharpest`/`confidence`), `limit`, `skip` |
| `GET` | `/records/{id}` | One record |
| `POST` | `/records/{id}/review` | Record a human label. Body: `{"label": "neem" \| "tulasi" \| "other"}` |
| `GET` | `/export` | Download records. Query parameters: `format` (`json`/`csv`), `label`, `source`, `status`, `include_embeddings` |
| `GET` | `/stats` | Totals and breakdowns used by the dashboard |
| `POST` | `/chat` | Dataset chatbot. Body: `{"message": "..."}` |
| `POST` | `/analyze-file` | Original single-image endpoint (CLIP + BLIP + generic YOLO detection) |
| `POST` | `/analyze` | Same as above with a base64 JSON body |
| `GET` | `/uploads` | Lists uploaded files |
| `GET` | `/files/{name}` | Serves an uploaded image |
| `GET` | `/dataset-images/{train\|val}/{name}` | Serves the original dataset images |

Example:

```bash
curl -F "file=@leaf.jpg" http://127.0.0.1:8000/analyze-agentic
curl -X POST http://127.0.0.1:8000/chat -H "Content-Type: application/json" \
     -d '{"message":"how many flagged images are there?"}'
```

---

## 🎓 Training the plant classifier

The classifier is a YOLOv8 **image-classification** model trained in Google Colab with `models/new copro.ipynb`.

1. Put your images in `copro/data/raw/neem/` and `copro/data/raw/tulasi/` on Google Drive.
2. Run the notebook's split cell (80% train / 20% validation) and the training cell (25 epochs).
3. Download `runs/classify/train/weights/best.pt` from Colab.
4. Save it as `Backend/yolov8_cls_best.pt` and restart the backend.

To add a new plant, add its folder of images, add its name to the `classes` list in the notebook and to `PLANT_CLASSES` in `Backend/main.py`, retrain, and replace the weights file. More training images per plant improves accuracy more than anything else.

Other files you may see: `models/copro.ipynb` and `models/separate.ipynb` are earlier experiments; `Backend/train_yolo.py` and `Backend/setup_dataset.py` belong to an earlier object-detection approach for neem only and are not used by the current pipeline.

---

## 🔒 Privacy and security

* **Where data goes.** Images and results stay on the machine running the backend and in your MongoDB, with one exception: **when `NVIDIA_API_KEY` is set, every analysed image is sent to NVIDIA's API** for the VLM annotation. The chatbot sends the **question and a few dataset records** (file names, captions, quality metrics and counts) to NVIDIA, not the images. If this is not acceptable, leave the key unset.
* **Secrets.** Keep keys in `Backend/.env.local` only. It is git-ignored. Never commit or share it, and rotate the key if it is ever exposed.
* **Chatbot safety.** The language model cannot write to the database; its output is validated against an allow-list before any query runs.
* **File uploads.** Uploaded file names are reduced to their base name, so a crafted name cannot write outside the uploads folder.
* **Login is not implemented.** The login and signup screens are visual only and nothing is protected. If the application is exposed beyond a trusted network, authentication must be added first.

---

## ⚠ Known limitations

* **Tulasi is untested.** The classifier was trained on both plants, but this project's test images were all neem. Verify tulasi accuracy on real photos before relying on it.
* **The 146 original images are labelled "neem" by assumption** (they came from a neem folder) and carry the status `Imported`, not a verified label.
* **Accuracy figure.** The 98.9% was measured on a validation split from the same image source as the training data. Photos taken in other conditions may score lower.
* **BLIP rarely votes**, so most images are decided by two voters (YOLO and CLIP).
* **The VLM can be wrong.** Its notes and leaf-condition judgements are model output, not ground truth. A human review is the final authority.
* **Login and signup are mock-ups**, as described above.
* **Hosted-API dependence.** If NVIDIA's API is slow or unavailable, uploads still work but without annotation, and the chatbot returns an error.
* **Single-image upload.** There is no batch upload yet.

---

## 🩺 Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| `Address already in use` on port 8000 | Another program is using it. Start the backend on another port (`--port 8010`) and set `VITE_API_URL` in `Frontend/.env.local` |
| Pages show "Couldn't load" | The backend isn't running, or `VITE_API_URL` points at the wrong port. Restart the frontend after changing `.env.local` |
| Every image is flagged | The classifier file is missing. Check **http://127.0.0.1:8000/agentic-status** shows `yolo_classifier_loaded: true` |
| "Hosted VLM annotation unavailable" | `NVIDIA_API_KEY` is missing or invalid, the API timed out, or the model isn't enabled for your key. Check `Backend/.env.local` and restart the backend |
| Chat says `NVIDIA_API_KEY is not configured` | Add the key to `Backend/.env.local` and restart the backend |
| Search is empty or the dashboard shows an error | MongoDB isn't running, or `MONGO_URI` is wrong |
| `pip install` fails with "filename too long" (Windows) | Use a virtual environment in a short path such as `C:\sdgvenv` |
| Slow first start | The CLIP and BLIP models are downloading. Later starts are faster |

---

## 📂 Project structure

```
Backend/
  main.py             FastAPI app: models, consensus pipeline, endpoints
  records.py          MongoDB storage, search, stats, review, export
  llm.py              NVIDIA API: image annotation and chatbot helpers
  schemas.py          Request/response schemas for the original endpoints
  yolov8_cls_best.pt  Trained neem/tulasi classifier
  requirements.txt    Python dependencies
  data/               Original neem images (train / val)
  uploads/            Images uploaded through the app
  .env.local          Your secrets (git-ignored, create this yourself)
Frontend/
  src/
    api.js            Backend address and request helper
    components/
      Analyze/        Image analysis page
      Search/         Search, filter and export
      Review/         Review queue
      Chat/           Dataset chatbot
      Dashboard/      Overview page
      Auth/           Login/Signup screens (UI only)
Data/Output/neem/     The original 146-record structured dataset (JSON)
models/               Colab notebooks (training and pipeline experiments)
```

---

## 🧰 Tech stack

* **Backend:** Python, FastAPI, PyTorch, Ultralytics YOLOv8, OpenCLIP, Hugging Face Transformers (BLIP), OpenCV, PyMongo
* **Hosted AI:** NVIDIA API (OpenAI-compatible) for vision-language annotation and the chatbot
* **Database:** MongoDB
* **Frontend:** React, Vite, Tailwind CSS, React Router

---

## 🔮 Possible future work

* Real authentication and user accounts
* Batch upload and background processing for large collections
* Similar-image search and duplicate detection using the stored CLIP embeddings
* More plant species and a larger, more varied training set
* Automatic retraining from human-reviewed labels

---

## 📄 License

This project is developed for academic and research purposes.
