export interface PaymentOrderData {
    amount: number;  // in smallest currency unit (paise for INR)
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }
  
export interface PaymentVerificationData {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }