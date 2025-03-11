const mongoose = require('mongoose');

require('dotenv').config()
// Replace with your MongoDB connection string
const MONGO_URI = process.env.MONGO_URI + process.env.MONGO_DB_NAME ;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
