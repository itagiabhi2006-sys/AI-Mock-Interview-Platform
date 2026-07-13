# 🎯 AI Mock Interview Platform

![Banner](screenshots/banner.png)

## 📖 Project Overview

The **AI Mock Interview Platform** is a full-stack web application designed to simulate real-world technical interviews using **Artificial Intelligence (AI)** and **Machine Learning (ML)**. It enables users to practice technical interviews, receive AI-generated feedback, analyze their performance, and improve their interview skills through personalized recommendations.

The platform consists of three independent services that work together seamlessly:

### 🖥️ Frontend (`frontend`)

The frontend is developed using **React**, **Vite**, and **Tailwind CSS**, providing a modern, responsive, and interactive user experience.

#### Features

- User Registration & Login
- Google OAuth Authentication
- GitHub OAuth Authentication
- User Dashboard
- Resume Upload
- Mock Interview Interface
- Live Camera Support
- Face Detection using MediaPipe
- Face Landmark Detection using TensorFlow.js
- Performance Analytics
- Interview History
- Responsive UI
- Smooth Animations using Framer Motion
- Charts using Recharts

---

### ⚙️ Backend (`backend`)

The backend is built with **Spring Boot** and manages all business logic, authentication, database operations, API integrations, and communication with AI services.

#### Features

- Spring Boot REST APIs
- JWT Authentication
- Google OAuth2 Login
- GitHub OAuth2 Login
- Role-Based Authorization
- User Management
- Interview Session Management
- Question Management
- Email Notifications (Brevo)
- Gemini AI Integration
- AI Interview Evaluation
- Session Summary Generation
- MySQL Database Integration

---

### 🤖 ML Service (`ml-service`)

The ML Service is a Python-based FastAPI application responsible for Natural Language Processing (NLP) and Machine Learning tasks.

#### Technologies

- FastAPI
- Sentence Transformers
- Scikit-Learn
- Pandas
- NumPy
- NLTK

#### Responsibilities

- Semantic Answer Similarity
- NLP Processing
- Keyword Matching
- Performance Prediction
- Recommendation Generation

---

# 🏗️ System Architecture

![Architecture](screenshots/architecture.png)

```text
                 React Frontend
                        │
                        │ REST API
                        ▼
              Spring Boot Backend
                        │
        ┌───────────────┴────────────────┐
        │                                │
        ▼                                ▼
    MySQL Database                 FastAPI ML Service
                                         │
                                         ▼
                                   Google Gemini AI
```

---

# 📸 Application Screenshots

## Home Page

![Home](screenshots/home.png)

---

## Login

![Login](screenshots/login.png)

---

## Dashboard

![Dashboard](screenshots/dashboard.png)

---

## Interview

![Interview](screenshots/interview.png)

---

## AI Feedback

![Feedback](screenshots/feedback.png)

---

## Analytics

![Analytics](screenshots/analytics.png)

---

## Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

---

# 🚀 Getting Started

## Prerequisites

Before running the project, install the following software:

- Java 21 or later
- Maven
- Node.js 20 or later
- Python 3.11 or later
- MySQL 8+
- Git

---

# 📂 Project Structure

```text
AI-Mock-Interview-Platform
│
├── frontend/
│
├── backend/
│
├── ml-service/
│
├── screenshots/
│
├── docs/
│
├── README.md
│
└── .gitignore
```

---

# ⚙️ Running the Project

Start all three services in the following order.

---

# 1. Start MySQL

Create a database.

```sql
CREATE DATABASE miniproject;
```

Ensure your MySQL server is running.

---

# 2. Start the ML Service

Navigate to the ML Service.

```bash
cd ml-service
```

Create a virtual environment (recommended).

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux/macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Run the FastAPI server.

```bash
uvicorn app:app --reload --port 8000
```

The ML service will be available at:

```
http://localhost:8000
```

---

# 3. Start the Backend

Navigate to the backend directory.

```bash
cd backend
```

Copy the environment template.

### Windows

```bash
copy .env.example .env
```

### Linux/macOS

```bash
cp .env.example .env
```

Fill in the `.env` file with:

- Database Credentials
- Gemini API Key
- Google OAuth Credentials
- GitHub OAuth Credentials
- SMTP Credentials

Run the backend.

### Windows

```bash
mvnw.cmd spring-boot:run
```

### Linux/macOS

```bash
./mvnw spring-boot:run
```

Backend URL:

```
http://localhost:8080
```

---

# 4. Start the Frontend

Navigate to the frontend folder.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Run the development server.

```bash
npm run dev
```

Frontend URL:

```
http://localhost:5173
```

Open the above URL in your browser.

---

# ▶️ Startup Order

Always start the services in the following order:

```text
MySQL
   │
   ▼
ML Service (FastAPI)
   │
   ▼
Spring Boot Backend
   │
   ▼
React Frontend
```

---

# 📁 Screenshots Folder

```text
screenshots/
│
├── banner.png
├── architecture.png
├── home.png
├── login.png
├── dashboard.png
├── interview.png
├── feedback.png
├── analytics.png
└── admin-dashboard.png
```

---

# 🛠️ Built With

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Recharts
- Framer Motion
- MediaPipe
- TensorFlow.js

### Backend

- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- JWT
- OAuth2
- MySQL
- Maven

### Machine Learning

- Python
- FastAPI
- Scikit-Learn
- Sentence Transformers
- NLTK
- Pandas
- NumPy

### AI

- Google Gemini API

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

# 📄 License

This project is developed for educational and research purposes.

---

# 👨‍💻 Author

**Abhishek Itagi**

Final Year Engineering Student

AI Mock Interview Platform

---

# 🙏 Acknowledgements

- Google Gemini API
- Spring Boot
- React
- FastAPI
- TensorFlow
- MediaPipe
- MySQL
- Tailwind CSS
- Scikit-Learn
- Open Source Community
