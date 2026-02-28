"""
Organize neem images into YOLO format and create data.yaml.

This script:
1. Splits images into train/val folders
2. Creates placeholder bounding box annotations
3. Generates data.yaml

Next step: Manually improve bounding boxes or use Roboflow for better annotations.
"""

import os
import shutil
from pathlib import Path
import random

# Paths
RAW_IMAGES_DIR = r"..\Data\Raw\plants\Neem\neem_class"
DATASET_DIR = r"data"
TRAIN_IMAGES_DIR = os.path.join(DATASET_DIR, "images", "train")
VAL_IMAGES_DIR = os.path.join(DATASET_DIR, "images", "val")
TRAIN_LABELS_DIR = os.path.join(DATASET_DIR, "labels", "train")
VAL_LABELS_DIR = os.path.join(DATASET_DIR, "labels", "val")

TRAIN_SPLIT = 0.8  # 80% train, 20% val


def create_dirs():
    """Create directory structure."""
    os.makedirs(TRAIN_IMAGES_DIR, exist_ok=True)
    os.makedirs(VAL_IMAGES_DIR, exist_ok=True)
    os.makedirs(TRAIN_LABELS_DIR, exist_ok=True)
    os.makedirs(VAL_LABELS_DIR, exist_ok=True)
    print("✅ Created directory structure")


def copy_and_split_images():
    """Copy images to train/val folders randomly."""
    images = [f for f in os.listdir(RAW_IMAGES_DIR) if f.lower().endswith(('.jpg', '.png'))]
    random.shuffle(images)
    
    split_idx = int(len(images) * TRAIN_SPLIT)
    train_images = images[:split_idx]
    val_images = images[split_idx:]
    
    # Copy train images
    for img in train_images:
        src = os.path.join(RAW_IMAGES_DIR, img)
        dst = os.path.join(TRAIN_IMAGES_DIR, img)
        shutil.copy2(src, dst)
    
    # Copy val images
    for img in val_images:
        src = os.path.join(RAW_IMAGES_DIR, img)
        dst = os.path.join(VAL_IMAGES_DIR, img)
        shutil.copy2(src, dst)
    
    print(f"✅ Split {len(images)} images: {len(train_images)} train, {len(val_images)} val")
    return train_images, val_images


def create_placeholder_annotations(images_list, output_labels_dir):
    """
    Create placeholder .txt files for annotations.
    Format: <class_id> <x_center> <y_center> <width> <height>
    
    Placeholder: class 0 (neem), covers 80% of image centered
    """
    for img in images_list:
        label_file = os.path.join(output_labels_dir, img.rsplit('.', 1)[0] + '.txt')
        
        # Placeholder bounding box: centered, covers ~80% of image
        # (x_center, y_center, width, height all normalized 0-1)
        bbox = "0 0.5 0.5 0.8 0.8\n"
        
        with open(label_file, 'w') as f:
            f.write(bbox)
    
    print(f"✅ Created {len(images_list)} placeholder annotations")


def create_data_yaml():
    """Create data.yaml for YOLO training."""
    dataset_path = os.path.abspath(DATASET_DIR).replace("\\", "/")
    
    yaml_content = f"""path: {dataset_path}
train: images/train
val: images/val
nc: 1
names: ['neem']
"""
    
    yaml_file = os.path.join(DATASET_DIR, "data.yaml")
    with open(yaml_file, 'w') as f:
        f.write(yaml_content)
    
    print(f"✅ Created {yaml_file}")


def main():
    print("=" * 60)
    print("Setting up YOLO dataset for neem plants...")
    print("=" * 60)
    
    if not os.path.exists(RAW_IMAGES_DIR):
        print(f"❌ ERROR: Raw images not found at {RAW_IMAGES_DIR}")
        return
    
    create_dirs()
    train_imgs, val_imgs = copy_and_split_images()
    create_placeholder_annotations(train_imgs, TRAIN_LABELS_DIR)
    create_placeholder_annotations(val_imgs, VAL_LABELS_DIR)
    create_data_yaml()
    
    print("\n" + "=" * 60)
    print("✅ Dataset setup complete!")
    print("=" * 60)
    print("\n📝 Next steps:")
    print("1. (Optional) Improve bounding boxes:")
    print("   - Use Roboflow (https://roboflow.com) for semi-automatic annotation")
    print("   - Or use LabelImg to manually annotate: https://github.com/heartexcel/labelImg")
    print("\n2. Train YOLO:")
    print("   python train_yolo.py")
    print("\n3. Run backend:")
    print("   uvicorn main:app --reload --port 8080")
    print("=" * 60)


if __name__ == "__main__":
    main()
