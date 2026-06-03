import sys
from PIL import Image

def process_and_resize(input_path, output_path):
    try:
        im = Image.open(input_path).convert("RGBA")
        width, height = im.size
        
        pixels = im.load()
        bg_color = pixels[0, 0]
        
        # 1. Flood fill from the edges to make ONLY the OUTER background transparent.
        # This prevents the inner screen (which is the same color) from becoming hollow!
        
        # Simple BFS for flood fill
        visited = set()
        queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        
        tolerance = 15
        
        def is_bg(c):
            return (abs(c[0] - bg_color[0]) < tolerance and
                    abs(c[1] - bg_color[1]) < tolerance and
                    abs(c[2] - bg_color[2]) < tolerance and 
                    c[3] > 0)

        while queue:
            x, y = queue.pop(0)
            if (x, y) in visited:
                continue
            visited.add((x, y))
            
            if is_bg(pixels[x, y]):
                pixels[x, y] = (255, 255, 255, 0) # Make transparent
                # add neighbors
                if x > 0: queue.append((x-1, y))
                if x < width - 1: queue.append((x+1, y))
                if y > 0: queue.append((x, y-1))
                if y < height - 1: queue.append((x, y+1))
                
        # 2. Find bounding box of non-transparent pixels
        bbox = im.getbbox()
        if not bbox:
            print("Image became completely transparent!")
            return
            
        print(f"Bounding box: {bbox}")
        cropped = im.crop(bbox)
        
        # 3. Add 10% padding so it's not too big
        cw, ch = cropped.size
        # The user wants it to match standard sizes. A 10% padding on each side means 
        # the logo takes up 80% of the canvas, which is very standard.
        pad_x = int(cw * 0.15)
        pad_y = int(ch * 0.15)
        
        new_w = cw + pad_x * 2
        new_h = ch + pad_y * 2
        
        # Make the canvas square so it doesn't get stretched by electron-builder
        size = max(new_w, new_h)
        
        final_im = Image.new("RGBA", (size, size), (255, 255, 255, 0))
        # paste in center
        offset_x = (size - cw) // 2
        offset_y = (size - ch) // 2
        final_im.paste(cropped, (offset_x, offset_y))
        
        final_im.save(output_path, "PNG")
        print("Successfully flood-filled outer background, cropped, and added standard padding.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    process_and_resize("build/icon.png", "build/icon.png")
