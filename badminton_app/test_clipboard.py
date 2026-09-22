import subprocess
import os

def copy_image_to_clipboard(image_path):
    abs_path = os.path.abspath(image_path)
    script = f'''
    set the clipboard to (read (POSIX file "{abs_path}") as TIFF picture)
    '''
    subprocess.run(['osascript', '-e', script])

print("Copying image...")
copy_image_to_clipboard("images/TWB-001.png")
print("Done!")
