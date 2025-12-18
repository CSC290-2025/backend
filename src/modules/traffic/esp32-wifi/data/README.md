# Data Folder

This folder contains optional files that can be uploaded to the ESP32's LittleFS filesystem.

## Firebase Configuration Methods

You can configure Firebase credentials in **two ways**:

### Method 1: Web Configuration (Recommended)

1. Connect to the ESP32's WiFi access point when in config mode
2. Open http://192.168.4.1 in your browser
3. Fill in the Firebase Configuration section with your credentials
4. Click "Save & Restart"

This is the easiest method and doesn't require uploading files.

### Method 2: .env File (Advanced)

If you prefer, you can upload a `.env` file to the ESP32's filesystem:

#### 1. Create your .env file

Copy the `.env.example` file and rename it to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and fill in your actual Firebase credentials:

```
API_KEY=your_firebase_api_key_here
DATABASE_URL=https://your-project-default-rtdb.region.firebasedatabase.app
USER_EMAIL=your_email@example.com
USER_PASSWORD=your_password_here
```

#### 2. Upload to ESP32

**Using PlatformIO:**

1. Make sure you have the LittleFS filesystem plugin installed
2. Place your `.env` file in this `data/` folder
3. Run the following command to upload the filesystem:

```bash
pio run --target uploadfs
```

Or in VSCode, use the PlatformIO: Upload File System Image task.

**Using Arduino IDE:**

1. Install the [ESP32 LittleFS Plugin](https://github.com/lorol/arduino-esp32littlefs-plugin)
2. Place your `.env` file in a folder named `data` in your sketch directory
3. Select Tools > ESP32 Sketch Data Upload

#### 3. Verify Upload

After uploading, you can verify the file was uploaded by checking the Serial Monitor when the ESP32 boots. You should see:

```
Reading .env file...
Firebase config loaded successfully
API_KEY: AIzaSyCsJQ...
DATABASE_URL: https://example-default-rtdb.asia-southeast1.firebasedatabase.app
USER_EMAIL: arduino@example.com
```

## Configuration Priority

The ESP32 loads Firebase configuration in this order:

1. **Preferences** (saved via web config mode) - Checked first
2. **/.env file** (uploaded to LittleFS) - Checked if preferences are empty
3. **No configuration** - Shows warning, Firebase won't connect

## Troubleshooting

**"WARNING: No Firebase configuration found"**

- Configure Firebase credentials via web config mode (Method 1), OR
- Upload a .env file (Method 2)

**".env file not found" but you uploaded it:**

- Make sure you uploaded the filesystem using the uploadfs command
- Verify the .env file is in the data/ folder before uploading
- The file must be named `.env` exactly (with the dot)

**Board won't connect to Firebase:**

- Check Serial Monitor for configuration values
- Verify API_KEY, DATABASE_URL, USER_EMAIL, and USER_PASSWORD are correct
- Test credentials in Firebase console first

## Security Note

**Never commit your actual `.env` file to version control!**

The `.env.example` file is safe to commit as it contains no real credentials.

Credentials stored in ESP32 Preferences are encrypted by the ESP32's flash encryption (if enabled).
