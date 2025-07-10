# SkillHive - Online Learning Platform

SkillHive is a modern, full-stack online learning platform that connects instructors with students, providing a seamless experience for course creation, learning, and analytics.

## Features

### For Instructors
- Create and manage courses
- Upload course content and materials
- Track student progress and engagement
- View detailed course analytics
- Manage course enrollment
- Publish/unpublish courses
- Edit course details and content

### For Students
- Browse available courses
- Enroll in courses
- Track learning progress
- Access course materials
- View course completion status
- Manage profile and preferences

### Analytics
- Course enrollment statistics
- Student progress tracking
- Engagement metrics
- Completion rates
- Revenue analytics (for paid courses)

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- React-Toastify for notifications
- Tailwind CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git https://github.com/hustlerkashish/skillhive.git
cd skillhive
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=....
JWT_SECRET=
PORT=5000


5. Create a `.env` file in the client directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

1. Start the backend server:
```bash
cd server
node server.js
```

2. Start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Courses
- GET /api/courses - Get all courses
- GET /api/courses/:id - Get course details
- POST /api/courses - Create new course
- PUT /api/courses/:id - Update course
- DELETE /api/courses/:id - Delete course
- GET /api/courses/:id/analytics - Get course analytics

### Enrollments
- POST /api/enrollments - Enroll in a course
- GET /api/enrollments - Get user enrollments
- GET /api/enrollments/:id - Get enrollment details

## Project Structure

```
skillhive/
├── client/                 # Frontend React application
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/         # Page components
│       ├── api/           # API integration
│       └── utils/         # Utility functions
│
├── server/                 # Backend Node.js application
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose models
│   └── routes/           # API routes
│
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License


## Support

