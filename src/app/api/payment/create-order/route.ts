import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    // First verify if we have the environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials are missing');
      return NextResponse.json(
        { error: 'Payment configuration missing' },
        { status: 500 }
      );
    }

    // Initialize Razorpay with proper error handling
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Get the request data
    const { amount, currency = 'INR', receipt } = await req.json();
    
    // Validate the amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create the order with proper error handling
    try {
      const options = {
        amount: Math.round(amount * 100), // amount in paise
        currency,
        receipt,
      };

      console.log('Creating order with options:', options);
      
      const order = await razorpay.orders.create(options);
      console.log('Order created:', order);

      return NextResponse.json({
        orderId: order.id,
        amount: options.amount,
        currency: options.currency
      });
      
    } catch (orderError) {
      console.error('Razorpay order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create payment order' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}