# SmartDocs AI – Context-Aware Corporate Knowledge Brain

---

## Overview

**SmartDocs AI** is an AI-powered document assistant designed to help organizations manage and interact with their SOPs (Standard Operating Procedures) and PDFs.  
Users can upload PDFs, ask questions in natural language, and receive AI-generated answers with source citations.  

The system leverages:
- PDF parsing and chunking  
- Embedding generation for semantic search  
- Real-time AI-powered chat  


---
## 🎯 Features

- 📄 Upload PDFs and automatically split them into chunks  
- 🔍 Ask questions about the content of uploaded documents   
- 🤖 AI-powered answer generation  
- 📌 Source citation (filename + page number)  
- 🚫 Hallucination prevention ("I don’t know" fallback)  
- 💬 Real-time streaming chat (SSE)  
- 🐳 Docker containerized
- 
---

## 🏗 Tech Stack

Frontend  
- React.js  

Backend  
- Node.js  
- Express.js  

Database  
- MongoDB Atlas (Vector Search)  

AI  
- Gemini Embeddings  
- gemini-1.5-flash 

Deployment  
- Docker  
- Render  
- Vercel  

---
