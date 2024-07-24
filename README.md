# Chat Application

This is a real-time chat application built with a TypeScript backend (Express.js) and a Next.js frontend.

## Project Structure

The project is divided into two main parts:

- `backend`: Express.js server with Socket.IO for real-time communication
- `frontend`: Next.js application with React components

## Features

- User registration and authentication
- Create and join chat rooms
- Real-time messaging
- Responsive design using Tailwind CSS

## Prerequisites

- Node.js (v14 or later)
- pnpm

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd chat-websocket-express-mono
   ```

2. Install dependencies:
   ```
   cd backend && pnpm install
   cd ../frontend && pnpm install
   ```

## Running the Application

1. Start the backend server:
   ```
   cd backend
   pnpm start
   ```

2. In a new terminal, start the frontend development server:
   ```
   cd frontend
   pnpm dev
   ```

3. Open your browser and navigate to `http://localhost:3001` to use the application.

## Backend API Endpoints

- POST `/api/users/register`: Register a new user
- POST `/api/users/login`: User login
- GET `/api/chatrooms`: Get list of chat rooms
- POST `/api/chatrooms`: Create a new chat room
- GET `/api/messages/:chatRoomId`: Get messages for a specific chat room
- POST `/api/messages`: Send a new message

## Frontend Pages

- `/`: Home page
- `/login`: User login page
- `/register`: User registration page
- `/chat-rooms`: List of available chat rooms
- `/chat/[id]`: Individual chat room page

## Technologies Used

- Backend: Express.js, Socket.IO, SQLite
- Frontend: Next.js, React, Tailwind CSS, shadcn/ui components
- Language: TypeScript
