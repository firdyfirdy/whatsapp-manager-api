# WhatsApp Manager API

A production-ready, modular, and open source REST API for managing WhatsApp Web sessions, sending messages, and integrating with webhooks. Built with Node.js, Express, and whatsapp-web.js.

---

## ⚠️ Disclaimer

> **WARNING:**
> 
> **This project uses an unofficial WhatsApp API (whatsapp-web.js). Use at your own risk.**
> - This project is not affiliated with, endorsed, or supported by WhatsApp Inc.
> - Your WhatsApp account may be subject to bans or restrictions. DWYOR (Do With Your Own Risk).

---

## Features
- **Multi-session management**: Create, list, and remove multiple WhatsApp Web sessions.
- **QR code pairing**: Retrieve QR codes for new sessions via API.
- **Send messages**: Programmatically send WhatsApp messages from any session.
- **Webhook integration**: Receive incoming messages via configurable webhooks (with optional basic auth).
- **Swagger UI**: Interactive API documentation and testing at `/api-docs`.
- **Logging**: All inbound requests and system events are logged to `logs/logs.txt`.
- **Validation**: Input validation for session names and message payloads.
- **Modular codebase**: Clean separation of routes, controllers, services, and utilities for easy maintenance and contribution.

---

## Getting Started

### Prerequisites
- Node.js v16 or higher
- npm
- Google Chrome or Chromium installed (for Puppeteer)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/whatsapp-web.js.git
   cd whatsapp-web.js
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and set the `CHROME_EXECUTABLE_PATH` to your Chrome/Chromium binary path.
   - Optionally set `PORT` and `SESSIONS_DIR`.

   Example `.env`:
   ```env
   CHROME_EXECUTABLE_PATH=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
   PORT=3000
   SESSIONS_DIR=./sessions
   ```
4. **Start the server:**
   ```bash
   npm start
   ```

---

## Usage
- Access the API at `http://localhost:3000/api`.
- Interactive API docs: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- Export the OpenAPI spec: [http://localhost:3000/swagger.json](http://localhost:3000/swagger.json)

### Example: Send a Message
```bash
curl -X POST http://localhost:3000/api/sessions/my_session/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "6281398184627@c.us",
    "message": "Hello from the API!"
  }'
```

---

## Contributing
We welcome contributions! To get started:
1. Fork this repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes with clear, descriptive commit messages.
4. Ensure your code passes linting and tests.
5. Submit a pull request with a detailed description of your changes.

**Please follow the existing code style and structure.**


---

## License
[MIT](LICENSE)
