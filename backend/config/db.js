import mongoose from 'mongoose';
import dns from 'dns';

// Ensure IPv4 DNS resolution for Windows / Node SRV queries
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/youngo_subscription');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn('⚠️ WARNING: Backend server running, but database connection failed. Database operations will fail.');
  }
};

export default connectDB;

