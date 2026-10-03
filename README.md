# Student Opportunity Engine - Backend

## Prerequisites
1. **Node.js** v16 or higher
2. **MongoDB**: You must have a MongoDB server running on your machine (port `27017`) or configure an Atlas cluster.
3. **Python 3.8+** (for the ML Recommendation server)

## Setup Instructions

1. **Install Dependencies**
   ```powershell
   cd backend
   npm install
   ```

2. **Environment Variables**
   Ensure you have a `.env` file in the `backend` directory. Use `.env.example` as a template:
   ```env
   MONGODB_URI=mongodb://localhost:27017/student-opportunity-engine
   JWT_SECRET=soe_jwt_secret_change_this_in_production_2026
   PORT=3000
   AI_API_KEY=your_groq_api_key_here
   ML_API_URL=http://127.0.0.1:5001
   ```
   *Note: Ensure your MongoDB server is running!*

3. **Seed the Database**
   To populate the system with test opportunities and projects, run the seed script:
   ```powershell
   node seed.js
   ```

4. **Start the ML Server**
   In a separate terminal, install the Python requirements and start the prediction server.
   *(We moved it to port 5001 to avoid conflicting with the Node backend).*
   ```powershell
   cd ../ml
   pip install -r requirements.txt
   python api_server.py
   ```

5. **Start the Node.js Server**
   ```powershell
   node server.js
   ```

6. **Run End-to-End Tests**
   With the backend running, you can run the automated tests to verify the entire system flow (Auth, Profiles, Skills, Recommendations, Roadmap, and Notifications).
   ```powershell
   node test-e2e.js
   ```

## Frontend Setup
The frontend is a static web application. You don't need a build step, but you should serve it over a local HTTP server to avoid CORS/file protocol issues.
```powershell
cd ../student-opportunity-engine
npx serve -p 8080
```
Then navigate to `http://localhost:8080`.
