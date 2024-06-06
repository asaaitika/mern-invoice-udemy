import chalk from "chalk";
import mongoose from "mongoose";
import { systemLogs } from "../utils/logger.js";

const env = process.env;

const mongoUrl = env.NODE_ENV === "development" ? env.MONGODB_URI_DEV : env.MONGO_URI_PROD;

const database = async () => {
    try {
        const conn = await mongoose.connect(mongoUrl, {}); 

        console.log(`${chalk.blue.bold(`MongoDB Connected: ${conn.connection.host}`)}`);
        systemLogs.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`${chalk.red.bold(`Error: ${error.message}`)}`);
        process.exit(1);
    }
};

export default database;