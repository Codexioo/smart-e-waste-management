# Smart E-Waste Management

![Expo](https://img.shields.io/badge/Expo-React%20Native-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![SQLite](https://img.shields.io/badge/SQLite-Database-lightgrey)

A cross-platform system for electronic waste collection with role-based mobile apps for customers and collectors, plus a web admin portal for managing pickups, users, and rewards.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the Project](#running-the-project)
- [User Roles](#user-roles)
- [Team](#team)

---

## Features

### Customer (Mobile App)
- Sign up / login with OTP verification
- Request e-waste pickups with location and waste type selection
- Track pickup status and history
- Earn reward points and level up
- In-app shop, cart, and orders

### Collector (Mobile App)
- Dashboard with earnings, active pickups, and lifetime stats
- Assigned pickups list with All / Pending / Completed filters
- Pickup details with call customer, map, and notes
- Update pickup status (start → collect weight → complete)
- Performance metrics, achievements, and earnings history

### Admin (Web Dashboard)
- Manage users, pickup requests, and products
- Assign collectors to pickup requests
- View dashboard analytics and reports

---

## Tech Stack

| Layer          | Technology              |
|----------------|-------------------------|
| Mobile App     | React Native (Expo)     |
| Mobile API     | Node.js + Express       |
| Admin Frontend | React (Create React App)|
| Admin API      | Node.js + Express       |
| Database       | SQLite                  |
| Auth           | JWT                     |
| Maps           | react-native-maps       |

---

## Project Structure

```
smart-e-waste-management/
├── client/              # Expo mobile app (customers & collectors)
├── server/              # Main API for mobile app (port 3001)
├── web-admin-client/    # Admin web UI (port 3000)
└── web-admin-server/    # Admin API (port 9091)
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- iOS Simulator, Android Emulator, or a physical device with Expo Go

### Installation

```bash
git clone https://github.com/Codexioo/smart-e-waste-management.git
cd smart-e-waste-management

cd server && npm install
cd ../client && npm install
cd ../web-admin-server && npm install
cd ../web-admin-client && npm install
```

---

## Running the Project

Run each service in a **separate terminal**.

### 1. Mobile API (required for the app)

```bash
cd server
npm start
```

Runs at **http://localhost:3001**

### 2. Mobile App

```bash
cd client
npx expo start
```

Then press **`i`** for iOS Simulator, **`a`** for Android Emulator, or scan the QR code with Expo Go.

> Use iOS or Android — not web — for full functionality (maps, location, etc.).

The app connects to the API automatically:
- iOS Simulator → `127.0.0.1:3001`
- Android Emulator → `10.0.2.2:3001`
- Physical device → your computer's LAN IP on port 3001

### 3. Admin API

```bash
cd web-admin-server
node server.js
```

Runs at **http://localhost:9091**

### 4. Admin Web Dashboard

```bash
cd web-admin-client
npm start
```

Open **http://localhost:3000**

---

## User Roles

| Role      | Access                                      |
|-----------|---------------------------------------------|
| Customer  | Mobile app — request pickups, shop, rewards |
| Collector | Mobile app — assigned pickups, earnings     |
| Admin     | Web dashboard — manage system               |

Sign up through the mobile app as a **customer** or **collector**. Admin accounts are managed separately in the admin system.

---

## Quick Reference

| Service         | Folder              | Port |
|-----------------|---------------------|------|
| Mobile API      | `server/`           | 3001 |
| Mobile App      | `client/`           | 8081 |
| Admin API       | `web-admin-server/` | 9091 |
| Admin Dashboard | `web-admin-client/` | 3000 |

---

## Team

- Rajapaksha R M S N R
- Rodrigo U M T H
- Perera W P M A N
- Bandara N G J C

> Developed as part of the university curriculum (ITPM – 3rd Year, 2nd Semester)
