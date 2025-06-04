
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/chatapp`);
        console.log(`\n MongoDB connected ! \n DB Host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MongoDB connection Failed: ", error);
        process.exit(1);
        
    }
}
exports.connectDB = connectDB;
