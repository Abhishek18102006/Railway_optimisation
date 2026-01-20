# RailFlow Optimizer 🚄

An intelligent railway traffic management system that uses AI/ML to detect and resolve train conflicts in real-time, optimizing railway operations and reducing delays.

## 📋 What is this?

RailFlow Optimizer is a decision-support system for railway traffic control that:

- **Detects Conflicts Automatically**: Identifies three types of train conflicts:
  - Same Block Conflicts (opposing trains on same track)
  - Loop Line Conflicts (trains too close on same direction)
  - Junction Conflicts (trains converging at junctions)

- **Provides AI Recommendations**: Uses a trained machine learning model to suggest optimal conflict resolutions based on train priority, passenger count, and other factors

- **Tracks Performance**: Monitors resolution success rates, delays reduced, and system efficiency

- **Maintains History**: Keeps complete audit trail of all train movements and conflict resolutions

## 🚀 How to Run

### Prerequisites
```bash
- Node.js (v18+)
- Python (v3.8+)
- PostgreSQL (v12+)
```

### Step 1: Clone and Install
```bash
# Clone repository
git clone https://github.com/yourusername/railflow-optimizer.git
cd railflow-optimizer

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install Python dependencies
cd ai_model
pip install pandas scikit-learn joblib numpy
cd ..
```

### Step 2: Setup Database
```sql
-- Create database
CREATE DATABASE rail.db;

-- Connect to database
\c rail.db

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    section_code VARCHAR(20)
);

-- Insert test user
INSERT INTO users (username, password, section_code) 
VALUES ('admin', 'admin123', 'SEC_001');
```

Edit `backend/db.js` with your PostgreSQL password:
```javascript
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "rail.db",
  password: "YOUR_PASSWORD",  // Change this
  port: 5432
});
```

### Step 3: Train the AI Model
```bash
cd ai_model

# Generate training data (200,000 scenarios)
python generate_training_data.py

# Train the model (creates model.pkl)
python train_model.py

cd ..
```

### Step 4: Start the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
node server.js
```
Backend runs at: `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```
Frontend runs at: `http://localhost:5173`

### Step 5: Login and Use

1. Open browser to `http://localhost:5173`
2. Login with credentials: `admin` / `admin123`
3. Upload a CSV file with train data (see format below)
4. System automatically detects conflicts
5. Click "Resolve with AI" to get recommendations
6. Accept or reject AI suggestions
7. View performance metrics and history

## 📊 CSV Format

Your train schedule CSV needs these columns:
```csv
train_id,train_name,source,destination,arrival_time,priority,max_speed,block_id,approach_dir,passengers,distance_km,travel_time_hr,train_capacity,is_peak_hour
```

**Example:**
```csv
train_id,train_name,source,destination,arrival_time,priority,max_speed,block_id,approach_dir,passengers,distance_km,travel_time_hr,train_capacity,is_peak_hour
101,Chennai Express,Chennai,Bangalore,09:30,3,100,BLK_MORNING,UP,780,350,5.5,1000,1
102,Coimbatore Intercity,Coimbatore,Chennai,09:32,2,80,BLK_MORNING,DOWN,420,495,7.2,900,1
```

**Required Fields:**
- `train_id`: Unique identifier
- `arrival_time`: Format HH:MM (24-hour)
- `priority`: 1-4 (1=lowest, 4=highest)
- `block_id`: Track block identifier
- `approach_dir`: "UP" or "DOWN"

See `ai_model/daily_schedule.csv` for a complete example.

## 🎯 How It Works

### 1. Conflict Detection
The system continuously monitors trains and detects:
- **Same Block**: Trains on same track from opposite directions with < 3 min gap
- **Loop Line**: Trains on same direction with < 5 min gap
- **Junction**: Multiple trains converging with insufficient clearance

### 2. AI Resolution
When conflict is detected:
- Extracts train features (priority, passengers, distance, etc.)
- Sends to ML model for prediction
- Model determines which train has priority
- Suggests action: HOLD, REDUCE_SPEED, or ROUTE_TO_LOOP

### 3. Decision Types
- **HOLD_TRAIN**: Stop train completely until conflict clears
- **REDUCE_SPEED**: Slow train to 60 km/h
- **ROUTE_TO_LOOP**: Divert train to loop line

### 4. Performance Tracking
System tracks:
- Total conflicts detected and resolved
- Average resolution time
- Delay reduction
- Success rate

## 🐛 Common Issues

**AI not working?**
- Check `model.pkl` exists in `ai_model/` folder
- Verify Python dependencies installed
- Ensure backend can run Python scripts

**No conflicts detected?**
- Verify CSV has `block_id`, `approach_dir`, `arrival_time`
- Check trains have overlapping times
- Open browser console (F12) for errors

**Can't login?**
- Verify PostgreSQL is running
- Check database credentials in `backend/db.js`
- Ensure `rail.db` database exists

**Trains not loading?**
- Check CSV format matches example
- Verify file is UTF-8 encoded
- Look for parsing errors in browser console

## 📁 Project Structure
```
railflow-optimizer/
├── src/
│   ├── components/       # React UI components
│   ├── pages/           # Main pages (Dashboard, History, etc.)
│   ├── utils/           # Conflict detectors and AI resolver
│   └── App.jsx          # Main application
├── backend/
│   ├── server.js        # Express API server
│   └── db.js            # Database configuration
├── ai_model/
│   ├── generate_training_data.py
│   ├── train_model.py
│   ├── predict_train.py
│   └── model.pkl        # Trained ML model (generated)
└── package.json
```
---

**⚠️ Note:** This is a demonstration system. Production railway use would require extensive testing, safety certifications, and regulatory approvals.
