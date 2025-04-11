# ♻️ Smart E-Waste System

A mobile and web-based platform designed to optimize electronic waste (e-waste) collection, incentivize users through a gamified reward system with **user levels**, and reduce environmental impact through efficient recycling processes.

---

## 🚀 Features

- 🔐 **Role-Based Authentication** – Secure login for users, collectors, and admins with OTP/password-based access.
- 🗓 **Pickup Request & Scheduling** – Users can request e-waste pickups; admins approve and schedule them.
- 🛍 **Reward System & User Levels** – Users earn points based on waste weight, level up through milestones, and redeem rewards.
- 📍 **Route Optimization** – Smart routing using Google Maps API for efficient waste collection logistics.
- 📊 **Reports & Dashboards** – Real-time management dashboards and transaction/report generation for all roles.

---

## 📱 Technologies Used

- **Frontend (Mobile App):** React Native with Expo
- **Backend API:** Node.js + Express
- **Database:** SQLite
- **Maps & Routing:** Google Maps API
- **Authentication:** OTP-based verification & JWT

---

## 🔧 Getting Started

### Prerequisites

- Node.js
- Expo CLI (`npm install -g expo-cli`)
- Android/iOS device or emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-ewaste-system.git
   cd smart-ewaste-system
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install mobile app dependencies**
   ```bash
   cd ../client
   npm install
   ```

---

## 🛠 Running the Project

### 1️⃣ Start the Backend Server

```bash
cd server
node server.js
```

### 2️⃣ Launch the Mobile App (Expo)

```bash
cd ../client
npx expo start
```

Scan the QR code using the Expo Go app or run it in an emulator.

---

## 🖥 Admin Dashboard

The web-based admin panel allows admins to manage pickup requests, assign collectors, track user activities, and generate reports.

- **Frontend**: React (`web-admin-client`)
- **Backend**: Node.js (`web-admin-server`)

Start them as follows:

```bash
cd web-admin-server
npm install
node server.js
```

```bash
cd ../web-admin-client
npm install
npm start
```

---

## 💡 Key Modules

- **Secure Authentication**
- **OTP-Based Collection Verification**
- **User Levels & Reward Milestones**
- **In-App Store (Gifts, Donations, Vouchers)**
- **Route Optimization**
- **Real-Time Notifications**
- **Admin/Collector/User Dashboards**

---

## 👥 Team Members

- Rajapaksha R M S N R
- Rodrigo U M T H
- Perera W P M A N
- Bandara N G J C

This project is part of a university coursework under the ITPM 3rd Year 2nd Semester curriculum.

---

## 📄 License

MIT License (or your preferred license here)