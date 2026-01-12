# Google Drive Backup System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-win%20%7C%20linux%20%7C%20macos-lightgrey.svg)
![TypeScript](https://img.shields.io/badge/built%20with-TypeScript-blue.svg)

**Enterprise-Grade Automation & Data Resiliency Tool.**

Designed by **Wick Studio**.  
*Secure, automated, and set-and-forget backup solution for your critical data.*

---

## 🌐 Connect with Wick
*   **GitHub**: [wickstudio](https://github.com/wickstudio)
*   **Instagram**: [@wicknux](https://instagram.com/wicknux)
*   **Community**: [Discord Server](https://discord.gg/wicks)

---

## Key Features

*   **Zero-Config Auth**: Seamless, secure OAuth 2.0 integration with Google Drive.
*   **Smart Scheduling**: Intelligent cron engine supporting natural shortcuts (`'1d'`, `'6h'`, `'30m'`).
*   **Real-Time Alerts**: Integrated Discord Webhook notifications for start, success, and failure events.
*   **Auto-Rotation**: Automated retention policies to manage storage costs and keep drives clean.
*   **High-Performance**: Optimized multi-threaded zlib compression for maximum space efficiency.
*   **Cross-Platform**: Native support for Windows, Linux (Ubuntu/Debian/CentOS), and macOS.

## Installation

Ensure you have [Node.js](https://nodejs.org/) installed, then run:

```bash
# Clone the repository (if applicable) or navigate to folder
npm install
npm run build
```

## Configuration

The system uses a single, type-safe configuration file. Edit `src/config.ts`:

```typescript
export const config: BackupConfig = {
    // 1. Define your source paths (Absolute paths recommended)
    backupPaths: [
        "C:/Users/Admin/Documents/Important",
        "/var/www/html/website"
    ],

    // 2. Google Drive Folder ID (from the folder URL)
    driveFolderId: "1Hkakj87gPXl6....",

    // 3. Scheduling (e.g., '1d' = Daily, '6h' = Every 6 hrs)
    schedule: "1d",

    // 4. Notifications (Optional: Paste Discord Webhook URL)
    discordWebhookUrl: "https://discord.com/api/webhooks/...",
    
    // 5. Retention (Number of backups to keep)
    retentionCount: 5
};
```

## Usage

### Start Automation Engine
```bash
npm start
```
*The system will initialize, authenticate (first run only), and enter background mode based on your schedule.*

### Credentials Setup
1.  Go to **Google Cloud Console**.
2.  Create an **OAuth 2.0 Client ID** (Application Type: *Desktop App*).
3.  Download the JSON, rename it to `credentials.json`, and place it in the project root.

---

## Monitoring

Logs are automatically rotated and stored in the `logs/` directory for audit purposes.
*   `logs/combined.log`: All operational logs.
*   `logs/error.log`: Critical failures only.

---
*© 2026 Wick Studio. All rights reserved.*