# Nutrica 🥗

> AI-Powered Nutrition Tracking Application

Nutrica is a modern, full-stack web application that helps users track their daily nutrition intake using AI-powered food analysis. Simply describe what you ate or upload a photo of your food, and Nutrica automatically extracts and logs detailed nutritional information including calories, carbohydrates, fats, and protein.

🌐 **Live Application**: [https://nutrica.app](https://nutrica.app)

## ✨ Features

### 🤖 AI-Powered Food Analysis
- **Image Recognition**: Upload photos of food labels or meals, and our AI extracts nutrition facts automatically
- **Natural Language Processing**: Describe your meals in plain English, and get instant nutrition analysis
- **Smart Emoji Generation**: Automatically generates relevant emojis for each food item

### 📊 Comprehensive Nutrition Tracking
- Track daily intake of calories, carbohydrates, fats, and protein
- View nutrition data by date with an intuitive calendar interface
- Set and monitor personalized nutrition goals
- Visual progress indicators and statistics

### 🎮 Gamification
- **Puzzle Collection System**: Collect puzzle pieces as you track your nutrition
- Unlock achievements and build your food collection
- Share your progress with friends and family

### 🎨 Modern User Experience
- Fully responsive design optimized for mobile and desktop
- Smooth animations and transitions
- Intuitive navigation with sidebar menu
- Real-time data updates
- Shareable nutrition reports with custom branding

### 🔐 Secure Authentication
- User registration and login with Supabase
- Secure password reset functionality
- Protected routes and data privacy

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Supabase** - Authentication and database
- **html2canvas** - Image generation for sharing
- **date-fns** - Date manipulation utilities

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **OpenAI API** - GPT-4 for food analysis
- **Supabase** - Database and authentication
- **Multer** - File upload handling
- **Winston** - Logging

### Infrastructure
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting
- **Supabase** - Database and auth service

## 📁 Project Structure

```
my-nutrition-demo-openai/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── common/      # Common UI elements
│   │   │   ├── home/        # Home page components
│   │   │   ├── navbar/      # Navigation components
│   │   │   ├── puzzles/     # Puzzle collection components
│   │   │   └── share/       # Sharing components
│   │   ├── pages/           # Page components
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── eat/         # Food logging pages
│   │   │   ├── home/        # Home dashboard
│   │   │   ├── my-collections/  # Collection management
│   │   │   └── share/       # Share page
│   │   ├── utils/           # Utility functions
│   │   │   ├── collections/ # Collection utilities
│   │   │   ├── core/        # Core utilities
│   │   │   ├── helpers/     # Helper functions
│   │   │   ├── media/       # Media handling
│   │   │   └── nutrition/   # Nutrition calculations
│   │   └── data/            # Static data
│   └── public/              # Static assets
│
└── backend/                  # Node.js backend API
    ├── src/
    │   ├── config/          # Configuration files
    │   ├── middleware/      # Express middleware
    │   │   ├── auth.js      # Authentication middleware
    │   │   ├── errorHandler.js
    │   │   ├── logger.js
    │   │   └── performance.js
    │   ├── routes/          # API routes
    │   │   ├── aiParse.js   # AI analysis endpoints
    │   │   ├── collection.js
    │   │   ├── foodSave.js
    │   │   └── user.js
    │   ├── services/        # Business logic
    │   │   ├── databaseService.js
    │   │   └── openaiService.js
    │   └── utils/           # Utility functions
    └── index.js             # Server entry point
```

## 🚀 Usage

Visit [https://nutrica.app](https://nutrica.app) to start tracking your nutrition!

### Getting Started
1. **Sign Up**: Create a new account or log in with existing credentials
2. **Set Goals**: Configure your daily nutrition goals (optional)
3. **Log Food**: 
   - Upload a photo of a nutrition label or food
   - Or describe what you ate in natural language
4. **Track Progress**: View your daily nutrition intake and progress toward goals
5. **Collect Puzzles**: Unlock puzzle pieces as you maintain consistent tracking
6. **Share**: Generate and share your nutrition reports

## 🔑 Key Features Explained

### AI Food Analysis
The application uses OpenAI's GPT-4 model to analyze food images and descriptions:
- **Image Analysis**: Extracts nutrition facts from food label photos
- **Description Analysis**: Estimates nutrition values from natural language descriptions
- **Error Handling**: Gracefully handles unrecognizable images or invalid descriptions

### Puzzle Collection System
A gamification feature that encourages consistent nutrition tracking:
- Users collect puzzle pieces based on their nutrition intake
- Puzzles are organized by food categories
- Completed puzzles can be viewed in the collections page
- Share your collections with others

### Nutrition Tracking
- Real-time calculation of daily nutrition totals
- Date-based navigation to view historical data
- Visual indicators for goal progress
- Automatic aggregation of multiple food entries

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4 API
- Supabase for authentication and database services
- Vercel and Railway for hosting infrastructure

---

Made with ❤️ for better nutrition tracking
