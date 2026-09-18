export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export enum DocApprovalStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

export enum TractorStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  RESERVED = 'RESERVED',
  DELIVERED = 'DELIVERED'
}

export enum PaymentMode {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  CREDIT = 'CREDIT',
  FINANCE = 'FINANCE',
  EXCHANGE = 'EXCHANGE',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum LeadSource {
  WALK_IN = 'Walk-in',
  REFERENCE = 'Reference',
  SOCIAL_MEDIA = 'Social Media',
  ADVERTISEMENT = 'Advertisement',
  OTHER = 'Other'
}

export enum CustomerStatus {
  E1 = 'E1',
  E2 = 'E2',
  E3 = 'E3',
  QUOTATION = 'GENERATE QUOTATION',
  INVOICE = 'GENERATE INVOICE',
  DELIVERY_CHALLAN = 'GENERATE DELIVERY CHALLAN',
  E4 = 'E4',
  SALES_LOST = 'Sales Lost',
  SALES_DROP = 'Sales Drop'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
  password?: string;
  mobileNumber?: string;
  permissions: string[]; // Added: stores IDs of accessible modules
}

export interface TractorModel {
  id: string;
  name: string;
  manufacturer: string;
  hp: string;
  description?: string;
  features?: string[];
}

export interface Tractor {
  id: string;
  modelName: string;
  manufacturer: string;
  hp: string; // Changed to string to support "40 HP" etc
  engineNo: string;
  chassisNo: string;
  exShowroomPrice: number;
  status: TractorStatus;
  color: string;
  hsnCode: string;
  createdAt: string;
}

export interface FollowupLog {
  id: string;
  date: string;
  type: 'CALL' | 'WHATSAPP' | 'VISIT' | 'OTHER';
  remarks: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  tehsil: string;
  village: string;
  sog: string;
  enquiryType: string;
  interestedModel: string;
  applicationUsage: string;
  interestedImplement: string;
  nextFollowupDays: number;
  expectedDeliveryDays: number;
  paymentMethod: string;
  bankName?: string;
  exchange: string; // 'Yes' or 'No'
  exchangeBrand?: string;
  exchangeModel?: string;
  exchangeYear?: string;
  createdAt: string;
  lastFollowupDate?: string;
  status: CustomerStatus;
  salesDropReason?: string;
  salesDropRemark?: string;
  salesLostReason?: string;
  salesLostRemark?: string;
  followups?: FollowupLog[];
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  particulars: string;
  transactionRef?: string;
}

export interface AccessoryItem {
  id: string;
  name: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  quotationId: string; // Enforced link
  date: string;
  customerId: string;
  tractorId: string;
  hypo?: string; // HDFC, etc
  basicAmount: number;
  rtoAmount: number;
  insuranceAmount: number;
  accessoriesAmount: number;
  accessoriesDetail?: AccessoryItem[];
  otherCharges: number;
  discountAmount: number;
  discountStatus: DocApprovalStatus;
  approvalStatus: DocApprovalStatus;
  totalAmount: number;
  paidAmount: number;
  paymentMode: PaymentMode;
  status: 'PAID' | 'PARTIAL' | 'DUE';
  notes?: string;
  salesExecutive?: string;
  placeOfSupply?: string;
  payments: PaymentRecord[];
}

export interface Quotation {
  id: string;
  quotationNo: string;
  date: string;
  customerId: string;
  tractorId: string;
  hypo?: string;
  basicAmount: number;
  rtoAmount: number;
  insuranceAmount: number;
  accessoriesAmount: number;
  accessoriesDetail?: AccessoryItem[];
  otherCharges: number;
  discountAmount: number;
  discountStatus: DocApprovalStatus;
  approvalStatus: DocApprovalStatus;
  totalAmount: number;
  validUntil: string;
  notes?: string;
  salesExecutive?: string;
}

export interface DeliveryChallan {
  id: string;
  challanNo: string;
  date: string;
  invoiceId?: string;
  customerId: string;
  tractorId: string;
  hypo?: string;
  deliveryAddress?: string;
  deliveredBy?: string;
  notes?: string;
  exchangeValue?: number;
  isExchangeConfirmed?: boolean;
  approvalStatus: DocApprovalStatus;
  checklist: {
    hitch: boolean;
    hood: boolean;
    toolKit: boolean;
    topLink: boolean;
    drawbar: boolean;
    frontBumper: boolean;
    battery: boolean;
    tyres: boolean;
    oilLevel: boolean;
    cultivator: boolean;
  };
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  timestamp: string;
}

export interface ShowroomSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  bankDetails: string;
  accountNumber: string;
  logoUrl: string;
  invoicePrefix: string;
  invoiceStartNumber: number;
  challanStartNumber: number;
  quotationStartNumber: number;
  footerMessage: string;
  isShopClosed?: boolean;
  closedAt?: string;
}

export interface ReturnRequest {
  id: string;
  requestId: string;
  date: string;
  tractorId: string;
  customerId: string;
  invoiceId: string;
  reason: string;
  staffId: string;
  staffName: string;
  status: DocApprovalStatus;
  approvedAt?: string;
  approvedBy?: string;
}
