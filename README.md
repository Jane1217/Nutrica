# Nutrica - AI-Powered Food Tracking App

## 1. Brief Summary of What Your Project Does

Nutrica is a full-stack web application that helps users track their daily nutrition intake using AI-powered food analysis. Users can describe what they ate in natural language, and the app automatically analyzes and logs nutritional information including calories, carbs, fats, and protein. The app features a modern, responsive design optimized for both mobile and desktop users.

## 2. Which Features You Chose to Include

### Frontend
- **Components**: Modular React components with reusable UI elements (modals, forms, navigation, toast notifications)
- **Animations**: Smooth transitions and loading states throughout the user interface
- **Mobile Responsiveness**: Fully responsive design with tablet/desktop layouts (≥768px) and mobile-first approach

### Backend
- **User Registration / Login / Logout Functionality**: Complete authentication system with Supabase integration
- **API Calls**: RESTful API endpoints for food management and AI analysis
- **Integration with Database**: Supabase database integration for user data and food records
- **Classes and Objects**: Structured service classes for OpenAI integration and food management

### Full-Stack Features
- **Frontend + Backend Integration**: React frontend seamlessly connected with Node.js/Express backend
- **Live Deployment**: Frontend deployed on Vercel with custom domain, backend on Railway
- **AI Integration**: OpenAI API integration for intelligent food analysis and emoji generation
- **Real-time Data**: Live updates and state management across the application
- **Share Functionality**: Generate shareable images of nutrition data with custom branding

## 3. How Much Time You Spent Developing This Project

**Total Development Time: 6 weeks**

**Team Size: 3 members**
- **1 UX Designer**: Responsible for user experience design, wireframes, and visual design
- **2 Full-Stack Developers**: Collaborative development of frontend and backend features
- **Development Split**: Each developer contributed approximately 50% of the codebase

## 4. Details for Running Your Project

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- OpenAI API key

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jane1217/Nutrica.git
   cd my-nutrition-demo-openai
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Add your environment variables
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Add your environment variables
   npm run dev
   ```

4. **Environment Variables**
   
   **Frontend (.env.local):**
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   **Backend (.env):**
   ```env
   PORT=3001
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   CORS_ORIGIN=http://localhost:5173
   ```

### Running the Project
- Frontend will be available at: http://localhost:5173
- Backend API will be available at: http://localhost:3001
