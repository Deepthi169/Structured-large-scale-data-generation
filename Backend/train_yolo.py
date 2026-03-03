"""
Train YOLOv8 on your neem plant dataset.

Before running this script:
1. Organize your images and annotations in YOLO format (see below)
2. Make sure you have the ultralytics package installed

Expected dataset structure:
    data/
    ├── images/
    │   ├── train/
    │   │   ├── 001.jpg
    │   │   ├── 002.jpg
    │   │   └── ...
    │   └── val/
    │       ├── 010.jpg
    │       └── ...
    └── labels/
        ├── train/
        │   ├── 001.txt  (format: <class_id> <x_center> <y_center> <width> <height>)
        │   ├── 002.txt
        │   └── ...
        └── val/
            ├── 010.txt
            └── ...

Then create a data.yaml file:
    path: /path/to/data
    train: images/train
    val: images/val
    nc: 1  # number of classes (just neem)
    names: ['neem']

Run this script to train.
"""

from ultralytics import YOLO
import os

# Path to your dataset YAML file
DATASET_YAML = "data/data.yaml"  # Update this path
MODEL_OUTPUT_NAME = "yolov8_neem.pt"

def train_custom_model():
    """Train YOLOv8 on custom neem plant dataset."""
    
    if not os.path.exists(DATASET_YAML):
        print(f"ERROR: {DATASET_YAML} not found!")
        print("Please create your dataset in YOLO format first.")
        print("See the docstring of this file for instructions.")
        return
    
    # Load a pretrained YOLOv8m model
    model = YOLO("yolov8m.pt")
    
    # Train the model on your neem dataset
    print("Starting training...")
    results = model.train(
        data=DATASET_YAML,
        epochs=50,  # Adjust based on dataset size
        imgsz=512,
        device=0,  # GPU device ID, or 'cpu' if no GPU
        batch=16,  # Adjust based on available memory
        patience=10,
        save=True,
        verbose=True
    )
    
    # Save the best model
    model.save(MODEL_OUTPUT_NAME)
    print(f"✅ Model saved as {MODEL_OUTPUT_NAME}")
    print(f"Training complete! Use this model in main.py")
    
    return results

if __name__ == "__main__":
    train_custom_model()
