const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const fs = require('fs');
const path = require('path');

const userRouter = require('./router/userRouter');
const taskRouter = require('./router/taskRouter');


const mongoConnect = require("../server/db/connect");
mongoConnect();

// Middleware setup
app.use(express.static('../client'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "7mb" }));
app.use('/uploads/Products', express.static(path.join(__dirname, 'uploads/products')));
// Router setup
app.use(userRouter);
app.use(taskRouter);


// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(500).send({
        success: false,
        message: "Something went wrong!",
    });
});



// Start server
app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
