# FrontLine

## Prerequisites
- Node.js (v18+)
- Xcode (for iOS development)
- CocoaPods: `sudo gem install cocoapods`

## Setup Instructions

### 1. Clone the Repository
```bash
git clone
cd operatorthing
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
✅ Server runs on `http://localhost:3000`

### 3. Operator Dashboard Setup
```bash
cd operator-dashboard
npm install
npm start
```
✅ Dashboard opens at `http://localhost:3000` (or 3001 if backend is on 3000)

### 4. Mobile App Setup (iOS)
```bash
cd EmergencyCallerApp
npm install
cd ios
pod install
cd ..
npx react-native run-ios
```
✅ iOS simulator launches automatically

## Running All Services

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - Dashboard:**
```bash
cd operator-dashboard && npm start
```

**Terminal 3 - Mobile:**
```bash
cd EmergencyCallerApp && npx react-native run-ios
```

## Project Structure
```
operatorthing/
├── EmergencyCallerApp/    # React Native iOS app (emergency caller)
├── operator-dashboard/    # React web app (911 operator)
└── backend/               # Node.js API + WebSocket server
```

## Troubleshooting

**iOS Simulator won't launch:**
1. Open Xcode → Preferences → Locations
2. Set Command Line Tools to your Xcode version
3. Run `sudo xcode-select --switch /Applications/Xcode.app`

**Port already in use:**
- Backend: Change `PORT` in `backend/src/index.ts`
- Dashboard: Set `PORT=3001` before `npm start`

**Pod install fails:**
```bash
cd EmergencyCallerApp/ios
pod deintegrate
pod install
```
