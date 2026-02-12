🎓 Student Department Management System (MERN Stack)

A full-stack Student Department Management System built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with Material UI for a modern interface.

This system allows faculty mentors to manage student records department-wise and year-wise with secure role-based authentication.

🚀 Features

🔐 Role-based login authentication (Mentor / Student)

🏫 Department-wise student management

👨‍🏫 Mentor access restricted to assigned year

📊 CRUD operations on student records

🎨 Modern UI using Material UI (MUI)

⚡ Fast frontend powered by Vite + React

🗄 MongoDB database integration

🌱 Database seeding script included

Installations and setup:

1️⃣ Clone Repository

git clone <repo-url>
cd project-folder

2️⃣ Setup Backend and frontend

Create a new terminal(ctrl + shift + ~) and run:
cd frontend
npm install

Add another new terminal(ctrl + shift + ~) and run:
cd server
npm install

3️⃣Create .env file inside server/

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

4️⃣Seed Database

Enter into your server folder: cd server
run: node seed.js

5️⃣Run frontend and backend

Ensure your path /client and run: npm run dev
Ensure your path /server and run: npm start(nodemon recomended)