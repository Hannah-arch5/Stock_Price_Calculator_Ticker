import sys
from PIL import Image

def enlarge_logo(input_path, output_path):
    try:
        im = Image.open(input_path).convert("RGBA")
        
        # Get the bounding box of the non-transparent pixels
        bbox = im.getbbox()
        if bbox:
            print(f"Original size: {im.size}, Bounding box: {bbox}")
            # Crop to the bounding box to remove all transparent padding
            im_cropped = im.crop(bbox)
            
            # Save the cropped image. 
            # electron-builder will automatically scale this up to fill the icon area!
            im_cropped.save(output_path, "PNG")
            print("Successfully cropped transparent padding, effectively enlarging the logo.")
        else:
            print("Image is entirely transparent, nothing to crop.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    enlarge_logo("build/icon.png", "build/icon.png")
