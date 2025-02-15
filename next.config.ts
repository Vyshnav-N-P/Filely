import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */ 
  env: {
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  },

  missingSuspenseWithCSRBailout: false,
};

 

export default nextConfig;
