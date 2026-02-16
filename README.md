# 🎓 Student Department Management System (MERN Stack)

A full-stack Student Department Management System built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with Tailwind CSS for a modern interface.

This system allows administrators to manage student records department-wise and year-wise with secure JWT-based authentication.

## 🚀 Features

- 🔐 Secure admin login authentication
- 🏫 Department-wise student management (CS, IT, CB, EE, ME)
- 📊 CRUD operations on student records
- 🎨 Modern UI using Tailwind CSS
- ⚡ Fast frontend powered by Vite + React
- 🗄 MongoDB database integration
- 🌱 Database seeding script included
- 📈 Student analytics and performance tracking
- 🔍 Advanced search and filtering

## Installations and Setup:

### 1️⃣ Clone Repository

```bash
git clone <repo-url>
cd dept-management-system
```

### 2️⃣ Setup Backend and Frontend

Create a new terminal (ctrl + shift + ~) and run:
```bash
cd frontend
npm install
```

Add another new terminal (ctrl + shift + ~) and run:
```bash
cd backend
npm install
```

### 3️⃣ Create .env file inside backend/

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### 4️⃣ Seed Database

Enter into your backend folder:
```bash
cd backend
node seeders/seed.js
```

### 5️⃣ Run Frontend and Backend

Ensure your path is `/frontend` and run:
```bash
npm run dev
```

Ensure your path is `/backend` and run:
```bash
npm run dev
```
(nodemon recommended)

---

**Login Credentials:**
- Email: `admin@bitsathy.ac.in`
- Password: `admin123`