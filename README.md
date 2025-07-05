# 🌿 AIHerb - Ayurvedic AI Health Assistant

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **AIHerb** is a comprehensive Ayurvedic AI health assistant that provides personalized health recommendations based on traditional Ayurvedic principles. It analyzes user symptoms, determines dosha imbalances, and offers customized herbal remedies, lifestyle advice, and wellness recommendations.

## 🎯 Project Overview

AIHerb combines ancient Ayurvedic wisdom with modern AI technology to provide personalized health guidance. The application features:

- **Symptom Analysis**: AI-powered analysis of user symptoms
- **Dosha Determination**: Automatic identification of Vata, Pitta, and Kapha imbalances
- **Personalized Recommendations**: Customized herbs, lifestyle, yoga, and meditation advice
- **Health Tracking**: Progress monitoring and health insights
- **User Dashboard**: Comprehensive health analytics and recommendations

## ✨ Features

### 🔐 User Management
- Secure user registration and authentication
- JWT-based session management
- User profile management with health preferences
- Password security with bcrypt hashing

### 🌿 Ayurvedic Analysis
- **Symptom Analysis**: Input symptoms and get detailed analysis
- **Dosha Detection**: Automatic identification of primary and secondary doshas
- **Imbalance Assessment**: Severity evaluation and health status
- **Personalized Recommendations**: Tailored advice based on dosha type

### 💊 Health Recommendations
- **Herbal Remedies**: Traditional Ayurvedic herbs with dosages
- **Lifestyle Guidance**: Diet, exercise, and daily routine recommendations
- **Yoga & Meditation**: Dosha-specific practices and techniques
- **Follow-up Planning**: Scheduled health check-ins and progress tracking

### 📊 Dashboard & Analytics
- **Health Score**: Overall wellness assessment
- **Progress Tracking**: Historical analysis and improvement trends
- **Activity Logging**: Comprehensive user activity tracking
- **Health Insights**: Seasonal patterns and dosha trends

### 🔒 Security & Performance
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Secure cross-origin requests
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Graceful error management

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients and animations
- **JavaScript**: Vanilla JS with ES6+ features
- **Responsive Design**: Mobile-first approach

### Database
- **MongoDB**: NoSQL database for flexible data storage
- **Collections**: Users, SymptomAnalysis, Activities
- **Indexing**: Optimized queries for performance
- **Data Validation**: Schema-based validation

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Siddhika1101/AyurAI-.git
cd AyurAI-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
```

**Environment Variables:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/aiherb

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
# Start MongoDB service
mongod
```

**MongoDB Atlas (Cloud):**
- Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a cluster and get connection string
- Update `MONGODB_URI` in `.env` file

### 5. Run the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 6. Verify Installation

Visit `http://localhost:5000/api/health` in your browser. You should see:
```json
{
  "status": "OK",
  "message": "AIHerb Backend is running",
  "timestamp": "2025-07-05T03:45:14.920Z"
}
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 30,
  "gender": "male"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### Symptom Analysis Endpoints

#### Analyze Symptoms
```http
POST /api/symptoms/analyze
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "symptoms": [
    {
      "name": "anxiety",
      "severity": "moderate",
      "duration": "2 weeks",
      "frequency": "daily"
    },
    {
      "name": "insomnia",
      "severity": "mild",
      "duration": "1 week",
      "frequency": "3-4 times per week"
    }
  ]
}
```

#### Get Analysis History
```http
GET /api/symptoms/history?page=1&limit=10
Authorization: Bearer <jwt_token>
```

### Dashboard Endpoints

#### Get Dashboard Overview
```http
GET /api/dashboard/overview
Authorization: Bearer <jwt_token>
```

#### Get User Activities
```http
GET /api/dashboard/activities?page=1&limit=10
Authorization: Bearer <jwt_token>
```

#### Get Health Insights
```http
GET /api/dashboard/insights
Authorization: Bearer <jwt_token>
```

## 🏗️ Project Structure

```
AyurAI-/
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── README.md                # Project documentation
│
├── models/                  # Database models
│   ├── User.js             # User authentication & profile
│   ├── SymptomAnalysis.js  # Symptom analysis & recommendations
│   └── Activity.js         # User activity tracking
│
├── routes/                  # API endpoints
│   ├── auth.js             # Authentication routes
│   ├── symptoms.js         # Symptom analysis routes
│   ├── dashboard.js        # Dashboard data routes
│   └── users.js            # User management routes
│
├── middleware/              # Custom middleware
│   └── auth.js             # JWT authentication middleware
│
├── hackathon 2k25/         # Frontend HTML files
│   ├── index.html          # Main landing page
│   ├── dashboard.html      # User dashboard
│   ├── homepage.html       # Home page
│   ├── main.html           # Main application page
│   ├── pres.html           # Presentation page
│   ├── ayurvedic.jpeg      # Ayurvedic image
│   └── api-integration.js  # Frontend-backend integration
│
└── api-integration.js       # Frontend integration helper
```

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  age: Number,
  gender: String,
  dosha: String,
  healthGoals: [String],
  medicalHistory: [Object],
  preferences: Object,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### SymptomAnalysis Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  symptoms: [{
    name: String,
    severity: String,
    duration: String,
    frequency: String
  }],
  analysis: {
    primaryDosha: String,
    secondaryDosha: String,
    imbalance: String,
    severity: String
  },
  recommendations: {
    herbs: [Object],
    lifestyle: Object,
    yoga: [Object],
    meditation: [Object]
  },
  status: String,
  userFeedback: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Activity Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String,
  title: String,
  description: String,
  metadata: Object,
  severity: String,
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port number | 5000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `MONGODB_URI` | MongoDB connection string | localhost:27017/aiherb | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `CORS_ORIGIN` | Allowed CORS origins | * | No |

### MongoDB Setup

**Local Installation:**
1. Download MongoDB Community Server
2. Install and start MongoDB service
3. Create database: `use aiherb`

**MongoDB Atlas (Cloud):**
1. Create account at MongoDB Atlas
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## 🧪 Testing

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Automated Testing
```bash
# Run test suite
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-aiherb-app

# Add MongoDB addon
heroku addons:create mongolab

# Deploy
git push heroku main
```

### Railway Deployment
1. Connect GitHub repository to Railway
2. Set environment variables
3. Deploy automatically

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ayurvedic Wisdom**: Traditional knowledge and principles
- **Open Source Community**: Libraries and tools used
- **Contributors**: Everyone who helps improve this project

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Siddhika1101/AyurAI-/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Siddhika1101/AyurAI-/discussions)
- **Email**: [Your Email]

## 🔮 Roadmap

### Version 1.1 (Next Release)
- [ ] Advanced AI symptom analysis
- [ ] Integration with external health APIs
- [ ] Mobile app development
- [ ] Multi-language support

### Version 1.2 (Future)
- [ ] Machine learning dosha prediction
- [ ] Telemedicine integration
- [ ] Health insurance integration
- [ ] Advanced analytics dashboard

---

**Made with ❤️ for better health through Ayurvedic wisdom**

[![GitHub stars](https://img.shields.io/github/stars/Siddhika1101/AyurAI-?style=social)](https://github.com/Siddhika1101/AyurAI-/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Siddhika1101/AyurAI-?style=social)](https://github.com/Siddhika1101/AyurAI-/network)
[![GitHub issues](https://img.shields.io/github/issues/Siddhika1101/AyurAI-)](https://github.com/Siddhika1101/AyurAI-/issues) 