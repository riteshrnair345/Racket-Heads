import csv
import time
import os
import pyautogui
import subprocess
import webbrowser
import pyperclip
import sys

# Configuration
CSV_FILE = "/Users/RiteshR/Desktop/The Weekend Baddie/badminton_app/contacts.csv" # "contacts.csv"
QR_FOLDER = "/Users/RiteshR/Desktop/The Weekend Baddie/badminton_app/qrcodes" # "qrcodes"
INITIAL_LOAD_TIME = 10 # Initial wait for WhatsApp to sync
WAIT_BEFORE_SEND = 8 # Wait time for the chat to switch
TAB_CLOSE_TIME = 5 # Wait after sending

print("🏸 Starting RacketHeads WhatsApp Automation...")

if not os.path.exists(CSV_FILE):
    print(f"❌ Error: Could not find '{CSV_FILE}'.")
    exit(1)

def countdown(t, message="Waiting"):
    """Displays a live countdown in the terminal so you know when the script will act."""
    for i in range(t, 0, -1):
        sys.stdout.write(f"\r⏳ {message}: {i} seconds remaining... (DO NOT TOUCH MOUSE/KEYBOARD)")
        sys.stdout.flush()
        time.sleep(1)
    sys.stdout.write(f"\r✅ {message}: Done!                                                       \n")

def copy_image_to_clipboard(image_path):
    abs_path = os.path.abspath(image_path)
    script = f'set the clipboard to (read (POSIX file "{abs_path}") as TIFF picture)'
    subprocess.run(['osascript', '-e', script])

# Open the ONLY tab we will use
print("\n🌐 Opening WhatsApp Web (One Tab Only)...")
webbrowser.open("https://web.whatsapp.com/")
countdown(INITIAL_LOAD_TIME, "Initial WhatsApp Web Sync")

# Read the CSV
with open(CSV_FILE, mode='r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    
    for row in reader:
        name = row.get("Name", "").strip()
        phone = row.get("Phone Number", "").strip()
        image_filename = row.get("Image Filename", "").strip()
        
        if not phone:
            continue
            
        message = f"Hi {name}! 🎉\n\nYour spot at RacketHeads Kochi is confirmed. Attached is your QR Code Entry Pass. Please show this at the court when you arrive."
        image_path = os.path.join(QR_FOLDER, image_filename)
        
        print(f"\n=========================================")
        print(f"📨 Sending to {name} at {phone}...")
        try:
            # 1. Switch chat in the SAME tab using Cmd+L (Address Bar)
            url = f"https://web.whatsapp.com/send?phone={phone}"
            pyperclip.copy(url)
            
            pyautogui.hotkey('command', 'l') # Focus address bar
            time.sleep(0.5)
            pyautogui.hotkey('command', 'v') # Paste URL
            time.sleep(0.5)
            pyautogui.press('enter')         # Navigate!
            
            countdown(WAIT_BEFORE_SEND, "Switching Chat")
            
            # 2. Check if the image exists
            if image_filename and os.path.exists(image_path):
                copy_image_to_clipboard(image_path)
                time.sleep(1)
                pyautogui.hotkey('command', 'v') 
                time.sleep(2) 
                
                pyperclip.copy(message)
                pyautogui.hotkey('command', 'v')
                time.sleep(1)
            else:
                print(f"⚠️ Could not find QR image '{image_filename}' in '{QR_FOLDER}'. Sending text only.")
                # Just copy and paste the text into the chat box
                pyperclip.copy(message)
                pyautogui.hotkey('command', 'v')
                time.sleep(1)

            # 3. Send!
            pyautogui.press('enter') 
            countdown(TAB_CLOSE_TIME, "Sending message")
            print(f"✅ Successfully sent to {name}")
            
        except Exception as e:
            print(f"❌ Failed to send to {name}: {e}")
            
        countdown(3, "Waiting before next user")

# Close the single tab at the very end
pyautogui.hotkey('command', 'w')
print("\n🎉 Finished sending all messages!")