// const express = require('express');
// const cookieParser = require('cookie-parser');
// const userRouter = require('./routes/userRouter');
// const connectDB = require('./services/db');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// connectDB();

// // Middleware
// app.use(express.json());
// app.use(cookieParser());



// // Routes
// app.use('/user', userRouter);

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRouter');
const connectDB = require('./services/db');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());


app.use(cors({
  origin: 'https://user-management-frontend-ashen.vercel.app/', // Frontend URL
  credentials: true, // Allow cookies
}));

// Routes
app.use('/user', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
