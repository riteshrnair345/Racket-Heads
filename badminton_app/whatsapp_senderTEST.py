"""
WhatsApp Bulk Message Sender
============================
Sends a personalized WhatsApp message (with image) to multiple people
from a CSV file. Uses pywhatkit + pyautogui to automate WhatsApp Web.

Requirements:
    pip install pywhatkit pyautogui pillow pandas

CSV Format (contacts.csv):
    name,phone,id
    Arun Kumar,+919876543210,TWB-001
    Meena Pillai,+919123456789,TWB-002

Image Folder:
    images/
        TWB-001.jpg   ← matched by ID (preferred)
        TWB-002.png
        Meena Pillai.jpg  ← fallback: matched by name

Usage:
    python whatsapp_sender.py
"""

import os
import time
import glob
import pandas as pd
import pyautogui
import pywhatkit as kit
from pathlib import Path
from datetime import datetime

# ─────────────────────────────────────────────
# CONFIGURATION — edit these before running
# ─────────────────────────────────────────────

# CSV_FILE = "D:/badminton_app/racketheads_export/racketheads_players.csv"     # "D:/badminton_app/contacts.csv"          # Path to your CSV file
# IMAGE_FOLDER = "D:/badminton_app/racketheads_export/qrcodes"                 # "images"            # Folder containing images
# ID_COLUMN = "Image Filename"                   # Column name for unique ID (e.g. TWB-001)
# NAME_COLUMN = "Name"               # Column name for person's name
# PHONE_COLUMN = "Phone Number"             # Column name for phone number (with country code)

CSV_FILE = "/Users/RiteshR/Desktop/The Weekend Baddie/badminton_app/contacts copy.csv" # "D:/badminton_app/contacts.csv"          # Path to your CSV file
IMAGE_FOLDER = "/Users/RiteshR/Desktop/The Weekend Baddie/badminton_app/images" # "/Users/RiteshR/Desktop/The Weekend Baddie/badminton_app/qrcodes" #"images"            # Folder containing images
ID_COLUMN = "id"                   # Column name for unique ID (e.g. TWB-001)
NAME_COLUMN = "name"               # Column name for person's name
PHONE_COLUMN = "phone"             # Column name for phone number (with country code)

# Message template — use {name} as a placeholder for the person's name
# MESSAGE_TEMPLATE = """Hi {name}! 👋

# Here's a friendly reminder for tomorrow's session with RacketHeads Kochi. We look forward to hosting you at our session! 
# Please show your QR Code attached here at the venue to check you in.

# Cheers,
# RacketHeads Kochi. 🏸"""

MESSAGE_TEMPLATE = """Hey {name}! 🏸🔥

The wait is over! We look forward to hosting you tomorrow for our first community session of RacketHeads Kochi.

Get ready for an epic time on the courts with fast-paced matches, great vibes, and our custom challenges.

📲 YOUR ACCESS PASS:
Attached to this message is your personal QR Code. Please keep this handy! You will need to scan it at the venue to check in.

📍 Venue: Pro Badminton Academy, Kannankulangara.
⏰ Time: 9 AM (Please arrive 15 mins early so we can kick off the group warm-up!)
👟 Reminder: Don't forget your racket, non-marking shoes, and your A-game!

Rest up, hydrate, and we will see you on the court tomorrow! 🚀

Cheers,
RacketHeads Kochi Team."""

# Delay settings
WAIT_BEFORE_SEND = 15   # Seconds to wait for WhatsApp Web to load (increase if slow internet)
WAIT_AFTER_SEND = 8     # Seconds to wait between messages (avoid getting flagged)

# ─────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────

SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"]

def find_image(person_id: str, person_name: str) -> str | None:
    """
    Looks for an image in IMAGE_FOLDER matching the person's ID first,
    then falls back to their name. Returns the file path or None.
    """
    folder = Path(IMAGE_FOLDER)
    if not folder.exists():
        print(f"  ⚠️  Image folder '{IMAGE_FOLDER}' not found.")
        return None

    # Try matching by ID
    for ext in SUPPORTED_EXTENSIONS:
        candidate = folder / f"{person_id}{ext}"
        if candidate.exists():
            return str(candidate)

    # Fallback: match by name (case-insensitive, spaces replaced with underscores or hyphens)
    name_variants = [
        person_name,
        person_name.replace(" ", "_"),
        person_name.replace(" ", "-"),
    ]
    for name_variant in name_variants:
        for ext in SUPPORTED_EXTENSIONS:
            candidate = folder / f"{name_variant}{ext}"
            if candidate.exists():
                return str(candidate)

    # Glob fallback: partial match on ID
    matches = list(folder.glob(f"{person_id}*"))
    if matches:
        return str(matches[0])

    print(f"  ⚠️  No image found for {person_name} (ID: {person_id})")
    return None


def send_message_with_image(phone: str, message: str, image_path: str | None):
    """
    Sends a WhatsApp message. If an image path is provided, opens WhatsApp Web,
    attaches the image, then sends. Otherwise sends text only.
    """
    now = datetime.now()
    send_hour = now.hour
    send_minute = now.minute  # Schedule 2 minutes from now

    # Handle minute overflow
    if send_minute >= 60:
        send_hour += 1
        send_minute -= 60

    if image_path:
        print(f"  📎 Attaching image: {image_path}")
        # pywhatkit opens WhatsApp Web and sends the image
        kit.sendwhats_image(
            receiver=phone,
            img_path=image_path,
            caption=message,
        )

    else:
        print(f"  💬 Sending text-only message")
        kit.sendwhatmsg(
            phone_no=phone,
            message=message,
            time_hour=send_hour,
            time_min=send_minute,
            wait_time=WAIT_BEFORE_SEND,
            tab_close=True,
        )


def validate_phone(phone: str) -> str:
    """
    Ensures the phone number has a + prefix and no spaces.
    """
    phone = str(phone).strip().replace(" ", "").replace("-", "")
    if not phone.startswith("+"):
        phone = "+" + phone
    return phone


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def main():
    print("=" * 50)
    print("  WhatsApp Bulk Sender — RacketHeads Kochi")
    print("=" * 50)

    # Load CSV
    if not os.path.exists(CSV_FILE):
        print(f"❌ CSV file '{CSV_FILE}' not found. Please check the path.")
        return

    df = pd.read_csv(CSV_FILE)
    print(f"\n✅ Loaded {len(df)} contacts from '{CSV_FILE}'\n")
    print(f"\n✅ Loaded csv: '{df.to_string()}'\n")

    # Validate required columns
    for col in [NAME_COLUMN, PHONE_COLUMN]:
        if col not in df.columns:
            print(f"❌ Column '{col}' not found in CSV. Check your column names.")
            return

    has_id_column = ID_COLUMN in df.columns

    # Preview
    print("Contacts to message:")
    print(df[[c for c in [NAME_COLUMN, PHONE_COLUMN, ID_COLUMN] if c in df.columns]].to_string(index=False))
    print()

    confirm = input(f"Send messages to {len(df)} people? (yes/no): ").strip().lower()
    if confirm != "yes":
        print("Aborted.")
        return

    print("\n⚠️  Make sure WhatsApp Web is already open and logged in in your browser.\n")
    time.sleep(2)

    # --- TIMER STARTS HERE ---
    start_time = time.time()

    success_count = 0
    fail_count = 0
    failed_contacts = []

    for i, row in df.iterrows():
        name = str(row[NAME_COLUMN]).strip()
        phone = validate_phone(row[PHONE_COLUMN])
        person_id = str(row[ID_COLUMN]).strip() if has_id_column else name

        print(f"\n[{i+1}/{len(df)}] Sending to {name} ({phone})...")

        # Build personalised message
         # Exclude columns already passed explicitly (name, phone) to avoid duplicate keyword args
        extra_cols = {k: v for k, v in row.items() if k not in [NAME_COLUMN, PHONE_COLUMN]}
        message = MESSAGE_TEMPLATE.format(name=name, **extra_cols) 
 
        # Find image
        image_path = find_image(person_id, name)

        try:
            send_message_with_image(phone, message, image_path)
            print(f"  ✅ Sent to {name}")
            success_count += 1
        except Exception as e:
            print(f"  ❌ Failed for {name}: {e}")
            fail_count += 1
            failed_contacts.append({"name": name, "phone": phone, "error": str(e)})

        # Wait between sends to avoid WhatsApp flagging
        if i < len(df) - 1:
            print(f"  ⏳ Waiting {WAIT_AFTER_SEND}s before next message...")
            time.sleep(WAIT_AFTER_SEND)

        # --- TIMER ENDS HERE ---
        end_time = time.time()
        elapsed_time = end_time - start_time
        
        # Calculate minutes and seconds
        minutes = int(elapsed_time // 60)
        seconds = int(elapsed_time % 60)

    # Summary
    print("\n" + "=" * 50)
    print(f"  Done! ✅ {success_count} sent   ❌ {fail_count} failed")
    print(f"  ⏱️  Total time taken: {minutes}m {seconds}s")
    print("=" * 50)

    if failed_contacts:
        print("\nFailed contacts:")
        for fc in failed_contacts:
            print(f"  - {fc['name']} ({fc['phone']}): {fc['error']}")


if __name__ == "__main__":
    main()