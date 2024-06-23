import mongoose from "mongoose";

/**
 * Connects to the database
 * @param {string} url
 * @returns
 */
const connectDB = (url) => {
  return mongoose.connect(url);
};

export default connectDB;
