import sys
from PIL import Image

def process_icon(input_path, output_path):
    try:
        im = Image.open(input_path).convert("RGBA")
        
        bg_color = im.getpixel((0, 0))
        print(f"Background color detected: {bg_color}")
        
        data = im.getdata()
        newData = []
        
        tolerance = 10  # strict tolerance so we don't delete white
        
        for item in data:
            if (abs(item[0] - bg_color[0]) < tolerance and
                abs(item[1] - bg_color[1]) < tolerance and
                abs(item[2] - bg_color[2]) < tolerance):
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        im.putdata(newData)
        
        # Now the image might have some jagged edges from shadows.
        # But this is the quickest way to get the central logo.
        im.save(output_path, "PNG")
        print("Successfully removed background with strict tolerance.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    process_icon("build/icon.png", "build/icon.png")
