# 🎭 Reactive Avatar Voice (Reactive Avatar Studio)

**Reactive Avatar Voice** is a lightweight, high-performance desktop application built with Electron, React, and TypeScript. It allows streamers (VTubers, PNGTubers, and TikTok creators) to create a reactive avatar that responds to their voice in real-time.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)

---

## ✨ Features

- 🎙️ **Real-time Voice Reactivity**: High-accuracy microphone detection using Web Audio API.
- 👁️ **Automatic Blinking**: Configurable random blink rate for a natural feel.
- 🚀 **Dynamic Animations**:
    - **Bounce**: Smooth vertical movement when speaking.
    - **Volume Scaling**: Real-time scaling based on voice intensity.
- 🎨 **Multi-Frame Talking**: Supports up to 3 frames of animation for smoother mouth movement.
- 🟢 **Green Screen Mode**: Integrated green screen background for easy chroma keying in OBS and TikTok Live Studio.
- 🖥️ **Always-on-Top Overlay**: Native window capture support for seamless streaming integration.
- ⚙️ **Persistent Settings**: Your configurations, sensitivity, and image paths are automatically saved.

---

## 📸 Screenshots
<p align="center">
<em>หน้าตาโปรแกรมและตัวอย่างการใช้งาน</em>
<img width="428" height="448" alt="Social Preview" src="https://github.com/user-attachments/assets/15006680-9002-4202-8e7b-19c464a827a5" />
<br>
<img width="1918" height="1030" alt="Social Preview" src="https://github.com/user-attachments/assets/a630fe6b-292d-4230-9c79-0a4a957a2b93" />
</p>

---

## 🛠️ Installation & Setup

### For Users
1. Download the latest `ReactiveAvatarVoice.exe` from the [Releases](https://github.com/JJacKTH/reactive-avatar-voice/releases) page.
2. Install and launch the application.
3. Select your microphone and upload your Idle, Blink, and Talk images.
4. Click **"Open Overlay"** to launch the avatar window.
5. In OBS or TikTok Live Studio, add a **Window Capture** source and select the "ReactiveAvatarVoice" window.
6. Use **Color Key / Chroma Key** to remove the green background.

### For Developers
```bash
# Clone the repository
git clone https://github.com/yourusername/reactive-avatar-voice.git

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run dist
```

---

## 📂 Project Structure

- `src/`: React frontend (Control Panel).
- `electron/`: Electron main process and preload scripts.
- `overlay.html`: The lightweight renderer for the avatar overlay.
- `assets/`: Icons and static resources.

---

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the project.

---

## 🇹🇭 ภาษาไทย (Summary)
**Reactive Avatar Voice** เป็นโปรแกรมสำหรับสตรีมเมอร์ที่ต้องการให้ตัวละคร (Avatar) ขยับตามเสียงพูด รองรับทั้ง OBS และ TikTok Live Studio โปรแกรมมีน้ำหนักเบา ปรับแต่งความไวของไมค์ได้ มีระบบกะพริบตาอัตโนมัติ และเอฟเฟกต์เด้งตามจังหวะเสียง (Bounce/Scale) ใช้งานง่ายเพียงแค่ใส่รูปภาพและเปิด Overlay

---

Created with ❤️ by [Adam Nightingale]([https://github.com/JJacKTH/reactive-avatar-voice/releases](https://www.facebook.com/adam.nightingale.2024/))
