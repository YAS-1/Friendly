# Friendly - Social Media Application

Friendly is a full-stack social media application built with modern web technologies, featuring real-time communication, user authentication, and social networking capabilities.

## Features

- User authentication and authorization
- Real-time messaging using Socket.IO
- Post creation and sharing
- Profile management
- Follow/Unfollow functionality
- Notifications system
- Password reset capability
- File uploads for posts and profile pictures
- Search functionality
- Bookmarking system
- Analytics tracking

## Tech Stack

### Frontend (Client)
- React.js with Vite
- TailwindCSS for styling
- React Query for data fetching
- Socket.IO client for real-time features
- React Router for navigation
- React Hot Toast for notifications
- React Icons for UI elements

### Backend (Server)
- Node.js with Express
- MongoDB with Mongoose ODM
- Socket.IO for real-time communication
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- Nodemailer for email services

## Project Structure

```
├── client/                 # Frontend application
│   ├── src/
│   │   ├── assets/        # Static assets
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context
│   │   ├── pages/         # Application pages
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main application component
│   │   └── main.jsx       # Application entry point
│   └── public/            # Public assets
│
├── server/                # Backend application
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── socket/           # Socket.IO setup
│   ├── utils/            # Utility functions
│   └── Uploads/          # File upload directory
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Friendly
```

2. Install frontend dependencies
```bash
cd client
npm install
```

3. Install backend dependencies
```bash
cd ../server
npm install
```

4. Create a .env file in the server directory with your configuration
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### Running the Application

1. Start the backend server
```bash
cd server
npm run dev
```

2. Start the frontend development server
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.