<div align="center">
  <h1>Lumina - Give your PDFs Superpower</h1>
  <p>Your intelligent AI-powered PDF chat companion</p>
</div>

## 🎯 Overview

Lumina transforms how you interact with PDF documents by providing an intuitive chat interface powered by advanced AI. Upload your PDFs and start having natural conversations about their content instantly.

<div align="center">
  <img src="/public/dashboard-preview.jpg" alt="Lumina Dashboard" width="100%"/>
</div>

## ✨ Key Features

- **🤖 AI-Powered Chat**: Have natural conversations with your PDF documents
- **📱 Modern Interface**: Clean, responsive design that works on all devices
- **🚀 Fast Processing**: Quick PDF parsing and real-time AI responses
- **🔐 Secure Authentication**: Robust user authentication via KindeAuth
- **📊 Smart Indexing**: Efficient document processing using Pinecone vector DB
- **☁️ Cloud Storage**: Reliable file storage with AWS S3

## 💡 How It Works

<div align="center">
  <img src="/public/file-upload-preview.jpg" alt="File Upload Interface" width="100%"/>
</div>

1. **Upload** - Simply drag and drop your PDF files
2. **Process** - Our AI analyzes and indexes your document
3. **Chat** - Ask questions and get intelligent responses
4. **Learn** - Gain insights from your documents effortlessly

## 🛠️ Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (Postgresql)
- **Authentication**: KindeAuth
- **Vector DB**: Pinecone
- **Storage**: AWS S3

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- KindeAuth account
- Pinecone account
- AWS account with S3 bucket

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/lumina.git
cd lumina
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# Database
DATABASE_URL=

# Authentication
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_ISSUER_URL=
KINDE_SITE_URL=
KINDE_POST_LOGOUT_REDIRECT_URL=
KINDE_POST_LOGIN_REDIRECT_URL=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

# Vector DB
PINECONE_API_KEY=
```

5. Run the development server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📖 Usage

1. **Create Account**: Sign up using your email or social accounts
2. **Upload PDF**: Use the drag-and-drop interface to upload your documents
3. **Start Chatting**: Ask questions about your document content
4. **Manage Documents**: Access your document history and conversations

---

<div align="center">
  Made with ❤️ by Aman
</div>
