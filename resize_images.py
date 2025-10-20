#!/usr/bin/env python3
"""
Image Optimization Script for Web
Resizes large images to web-appropriate dimensions while maintaining quality
"""

import os
import sys
from PIL import Image, ImageOps
import shutil
from pathlib import Path

# Configuration
MAX_WIDTH = 1200  # Maximum width for web images
MAX_HEIGHT = 900  # Maximum height for web images
QUALITY = 85      # JPEG quality (85 is excellent for web)
MIN_SIZE_MB = 0.5  # Only resize files larger than 0.5MB

def get_file_size_mb(filepath):
    """Get file size in MB"""
    return os.path.getsize(filepath) / (1024 * 1024)

def resize_image(input_path, output_path, max_width=MAX_WIDTH, max_height=MAX_HEIGHT, quality=QUALITY):
    """Resize image maintaining aspect ratio"""
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (handles RGBA, P modes, etc.)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create a white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Correct image orientation based on EXIF data
            img = ImageOps.exif_transpose(img)
            
            # Calculate new dimensions maintaining aspect ratio
            original_width, original_height = img.size
            
            # Calculate scaling factor
            width_ratio = max_width / original_width
            height_ratio = max_height / original_height
            scale_factor = min(width_ratio, height_ratio, 1.0)  # Don't upscale
            
            if scale_factor < 1.0:
                new_width = int(original_width * scale_factor)
                new_height = int(original_height * scale_factor)
                
                # Resize using high-quality resampling
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                print(f"  Resized from {original_width}×{original_height} to {new_width}×{new_height}")
            else:
                print(f"  Image already optimal size: {original_width}×{original_height}")
            
            # Save with optimization
            img.save(output_path, 'JPEG', quality=quality, optimize=True, progressive=True)
            return True
            
    except Exception as e:
        print(f"  ERROR: {str(e)}")
        return False

def process_images(directory="assets"):
    """Process all images in the assets directory"""
    image_extensions = {'.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp'}
    processed_count = 0
    skipped_count = 0
    error_count = 0
    total_size_before = 0
    total_size_after = 0
    
    print("🖼️  Image Optimization Script Starting...")
    print(f"📁 Scanning directory: {directory}")
    print(f"⚙️  Max dimensions: {MAX_WIDTH}×{MAX_HEIGHT}px, Quality: {QUALITY}%")
    print(f"📏 Processing files larger than {MIN_SIZE_MB}MB\n")
    
    # Find all image files
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = Path(root) / file
            
            if file_path.suffix.lower() in image_extensions:
                file_size_mb = get_file_size_mb(file_path)
                total_size_before += file_size_mb
                
                if file_size_mb >= MIN_SIZE_MB:
                    print(f"📸 Processing: {file_path} ({file_size_mb:.1f}MB)")
                    
                    # Create backup
                    backup_path = file_path.with_suffix(f'.backup{file_path.suffix}')
                    shutil.copy2(file_path, backup_path)
                    
                    # Resize image
                    success = resize_image(file_path, file_path)
                    
                    if success:
                        new_size_mb = get_file_size_mb(file_path)
                        total_size_after += new_size_mb
                        reduction = ((file_size_mb - new_size_mb) / file_size_mb) * 100
                        print(f"  ✅ Reduced from {file_size_mb:.1f}MB to {new_size_mb:.1f}MB ({reduction:.1f}% reduction)")
                        processed_count += 1
                        
                        # Remove backup if successful
                        backup_path.unlink()
                    else:
                        # Restore from backup on error
                        shutil.move(backup_path, file_path)
                        total_size_after += file_size_mb
                        error_count += 1
                        print(f"  ❌ Failed - restored original")
                else:
                    total_size_after += file_size_mb
                    skipped_count += 1
                    print(f"📸 Skipped: {file_path} ({file_size_mb:.1f}MB - already optimized)")
    
    # Summary
    print(f"\n📊 OPTIMIZATION COMPLETE!")
    print(f"✅ Processed: {processed_count} images")
    print(f"⏭️  Skipped: {skipped_count} images (already optimal)")
    print(f"❌ Errors: {error_count} images")
    
    if processed_count > 0:
        total_reduction = total_size_before - total_size_after
        percentage_reduction = (total_reduction / total_size_before) * 100
        print(f"💾 Size reduction: {total_size_before:.1f}MB → {total_size_after:.1f}MB")
        print(f"🎯 Total saved: {total_reduction:.1f}MB ({percentage_reduction:.1f}% reduction)")
    
    print(f"\n🚀 Your website will now load much faster!")

if __name__ == "__main__":
    try:
        # Install Pillow if not available
        process_images()
    except ImportError:
        print("📦 Installing required dependency (Pillow)...")
        os.system("pip3 install Pillow")
        print("✅ Installation complete! Running optimization...")
        process_images()
    except KeyboardInterrupt:
        print("\n⏹️  Operation cancelled by user")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")