# AIHerb Backend

A comprehensive Node.js/Express backend for the AIHerb Ayurvedic AI application, providing user authentication, symptom analysis, and personalized health recommendations.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Symptom Analysis**: AI-powered Ayurvedic symptom analysis and dosha determination
- **Personalized Recommendations**: Herbs, lifestyle, yoga, and meditation recommendations
- **Dashboard Analytics**: User progress tracking and health insights
- **Activity Tracking**: Comprehensive user activity logging
- **Data Export**: User data export functionality
- **RESTful API**: Clean, well-documented API endpoints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Logging**: Morgan

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aiherb-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/aiherb
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Start MongoDB**
   - Local: Start MongoDB service
   - Cloud: Use MongoDB Atlas or similar service

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | User login |
| GET | `/profile` | Get user profile |
| PUT | `/profile` | Update user profile |
| PUT | `/change-password` | Change password |

### Symptoms Analysis (`/api/symptoms`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyze symptoms and get recommendations |
| GET | `/history` | Get user's analysis history |
| GET | `/analysis/:id` | Get specific analysis |
| PUT | `/analysis/:id/status` | Update analysis status |
| POST | `/analysis/:id/feedback` | Provide feedback on recommendations |

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overview` | Get dashboard overview data |
| GET | `/activities` | Get user activities |
| GET | `/progress` | Get analysis progress |
| GET | `/recommendations` | Get recommendations summary |
| GET | `/insights` | Get health insights |

### Users (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get user statistics |
| GET | `/export` | Export user data |
| DELETE | `/account` | Delete user account |
| GET | `/dosha-history` | Get dosha test history |
| PUT | `/preferences` | Update user preferences |

## API Usage Examples

### User Registration
```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    age: 30,
    gender: 'male'
  })
});

const data = await response.json();
// { message: 'User registered successfully', token: '...', user: {...} }
```

### Symptom Analysis
```javascript
const response = await fetch('http://localhost:5000/api/symptoms/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    symptoms: [
      {
        name: 'anxiety',
        severity: 'moderate',
        duration: '2 weeks',
        frequency: 'daily'
      },
      {
        name: 'insomnia',
        severity: 'mild',
        duration: '1 week',
        frequency: '3-4 times per week'
      }
    ]
  })
});

const data = await response.json();
// { analysis: {...}, recommendations: {...}, analysisId: '...' }
```

### Get Dashboard Data
```javascript
const response = await fetch('http://localhost:5000/api/dashboard/overview', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
// { recentActivities: [...], recentAnalyses: [...], statistics: {...} }
```

## Database Schema

### User Model
- Basic info: name, email, password, age, gender
- Health data: dosha, health goals, medical history
- Preferences: dietary restrictions, allergies, lifestyle

### SymptomAnalysis Model
- User symptoms and their details
- Dosha analysis results
- Personalized recommendations
- Follow-up scheduling
- User feedback

### Activity Model
- User activity tracking
- Different activity types
- Metadata for detailed tracking

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: express-validator for all inputs
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers
- **Rate Limiting**: Built-in protection against abuse

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error information (development only)"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Development

### Project Structure
```
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── server.js        # Main server file
├── package.json     # Dependencies
└── env.example      # Environment variables template
```

### Adding New Features

1. **Create Model** (if needed): Add to `models/` directory
2. **Create Routes**: Add to `routes/` directory
3. **Update Server**: Register new routes in `server.js`
4. **Add Validation**: Use express-validator for input validation
5. **Add Tests**: Write tests for new functionality

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | localhost:27017/aiherb |
| `JWT_SECRET` | JWT signing secret | (required) |
| `CORS_ORIGIN` | Allowed CORS origins | * |

## Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`
   - Configure production `MONGODB_URI`

2. **Security**
   - Enable HTTPS
   - Configure CORS properly
   - Set up rate limiting
   - Use environment-specific secrets

3. **Monitoring**
   - Set up logging
   - Monitor performance
   - Set up error tracking

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository. 