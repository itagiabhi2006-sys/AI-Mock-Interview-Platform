# AI Interview Platform - Frontend

This is the frontend repository for the AI Interview Platform. It provides a beautiful, modern, and immersive web application for users to practice and analyze their interview skills.

## 🚀 Features
- **Premium UI/UX:** Built with a stunning modern aesthetic, featuring glassmorphism elements, dynamic background gradients, and smooth animations.
- **AI-Powered Interviews:** Users can select different roles and participate in live interview simulations.
- **Real-Time Tracking:** Includes live soft skill tracking.
- **Comprehensive Analytics:** Detailed dashboard providing deep insights into session history, performance trends, and role-based score distribution.
- **Session Analysis:** An immersive interface for reviewing AI feedback and scores on individual questions.
- **Admin Dashboard:** Tools for administrators to manage users and interview questions.

## 🛠️ Technology Stack
- **Framework:** React + Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS (with advanced glassmorphism and gradient patterns)
- **Icons:** Lucide React
- **Charting:** Recharts

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone this repository.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally
To start the development server, run:
```bash
npm run dev
```
The application will usually be available at `http://localhost:5173`.

### Building for Production
To build the application for deployment:
```bash
npm run build
```
The optimized static files will be generated in the `dist` directory.

## 🔗 Backend
This repository contains only the frontend application. The backend (API and AI integration) is maintained in a separate repository. Ensure the backend server is running and configure the API endpoints in the `Api.jsx` or environment variables accordingly to connect the two.
