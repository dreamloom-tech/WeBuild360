export interface FundInflow {
  _id?: string;
  projectId: string;
  date: string;
  amount: number;
  mode: 'cash' | 'bank' | 'upi';
  comments?: string;
  createdAt: string;
  
  // Bank specific fields
  bankName?: string;
  ifsc?: string;
  
  // UPI specific fields
  mobileNumber?: string;
  upiId?: string;
  whoPaid?: string;
  whoReceived?: string;
  upiApp?: 'GPAY';
}

export interface FundInflowFormData {
  projectId: string;
  date: string;
  amount: string | number;
  mode: 'cash' | 'bank' | 'upi';
  comments?: string;
  
  // Bank specific fields
  bankName?: string;
  ifsc?: string;
  
  // UPI specific fields
  mobileNumber?: string;
  upiId?: string;
  whoPaid?: string;
  whoReceived?: string;
  upiApp?: 'GPAY';
}