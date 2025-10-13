#!/usr/bin/env python3
"""
Remove black bars from images while maintaining 16:9 aspect ratio
"""

import os
from PIL import Image, ImageOps
import numpy as np

def remove_black_bars_and_resize(image_path, target_aspect_ratio=16/9):
    """
    Remove black bars from image and ensure 16:9 aspect ratio
    """
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Convert to numpy array for easier processing
            img_array = np.array(img)
            
            # Find non-black regions (allowing for some tolerance)
            # Black bars are typically very dark (close to 0,0,0)
            threshold = 30  # Adjust this if needed
            non_black = np.any(img_array > threshold, axis=2)
            
            # Find the bounding box of non-black regions
            rows = np.any(non_black, axis=1)
            cols = np.any(non_black, axis=0)
            
            if not np.any(rows) or not np.any(cols):
                print(f"Warning: {image_path} appears to be entirely black")
                return False
            
            # Get the cropping coordinates
            top, bottom = np.where(rows)[0][[0, -1]]
            left, right = np.where(cols)[0][[0, -1]]
            
            # Add small padding to avoid cutting content
            padding = 2
            top = max(0, top - padding)
            bottom = min(img_array.shape[0] - 1, bottom + padding)
            left = max(0, left - padding)
            right = min(img_array.shape[1] - 1, right + padding)
            
            # Crop the image
            cropped_img = img.crop((left, top, right + 1, bottom + 1))
            
            # Calculate current aspect ratio
            current_width, current_height = cropped_img.size
            current_aspect = current_width / current_height
            
            # Adjust to target aspect ratio (16:9)
            if current_aspect > target_aspect_ratio:
                # Image is too wide, crop width
                new_width = int(current_height * target_aspect_ratio)
                left_crop = (current_width - new_width) // 2
                cropped_img = cropped_img.crop((left_crop, 0, left_crop + new_width, current_height))
            elif current_aspect < target_aspect_ratio:
                # Image is too tall, crop height
                new_height = int(current_width / target_aspect_ratio)
                top_crop = (current_height - new_height) // 2
                cropped_img = cropped_img.crop((0, top_crop, current_width, top_crop + new_height))
            
            # Save the processed image
            cropped_img.save(image_path, quality=95, optimize=True)
            print(f"✅ Processed {image_path}")
            return True
            
    except Exception as e:
        print(f"❌ Error processing {image_path}: {e}")
        return False

def process_assets_folder():
    """
    Process all images in the assets folder
    """
    assets_path = "assets"
    processed_count = 0
    
    # Supported image extensions
    image_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    
    for root, dirs, files in os.walk(assets_path):
        for file in files:
            if any(file.lower().endswith(ext) for ext in image_extensions):
                image_path = os.path.join(root, file)
                if remove_black_bars_and_resize(image_path):
                    processed_count += 1
    
    print(f"\n🎉 Processed {processed_count} images successfully!")

if __name__ == "__main__":
    print("🚀 Starting black bar removal and 16:9 aspect ratio correction...")
    print("📁 Processing images in assets folder...")
    
    try:
        import PIL
        process_assets_folder()
    except ImportError:
        print("❌ Pillow (PIL) is required. Install it with: pip install Pillow")
        print("📋 Alternative: pip3 install Pillow")