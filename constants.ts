
import { ShowroomSettings, TractorStatus, LeadSource } from './types';

export const APP_NAME = "Satyam Eicher Desk";

// Fixed: Added missing bankDetails properties to match ShowroomSettings interface
export const DEFAULT_SETTINGS: ShowroomSettings = {
  name: "Satyam Eicher Tractors",
  address: "Main Highway, Industrial Area, Punjab, India",
  phone: "+91 9876543210",
  email: "sales@satyameicher.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Eicher_logo.svg/1200px-Eicher_logo.svg.png",
  invoicePrefix: "SE",
  invoiceStartNumber: 1,
  challanStartNumber: 1,
  quotationStartNumber: 1,
  footerMessage: "Thank you for choosing Satyam Eicher. Powering your progress!",
  bankDetails: "HDFC BANK, IFSC: HDFC0001234",
  accountNumber: "50200012345678",
  isShopClosed: false
};

export const MANUFACTURERS = [
  "Eicher"
];

export const TRACTOR_MODELS = [
  "188",
  "188 4WD",
  "241",
  "242",
  "330",
  "333",
  "333 SUPER+",
  "368",
  "380",
  "380 4WD",
  "480",
  "480 4WD",
  "485",
  "485 SUPER+",
  "548",
  "551",
  "551 4WD",
  "551 SUPER+",
  "557",
  "557 4WD",
  "380 PRIMA G3",
  "380 4WD PRIMA G3",
  "557 PRIMA G3",
  "557 4WD PRIMA G3",
  "333 SUPER+ PRIMA G3",
  "480 PRIMA G3",
  "480 4WD PRIMA G3",
  "551 PRIMA G3",
  "551 4WD PRIMA G3",
  "551 SUPER+ PRIMA G3",
  "551 SUPER+ 4WD PRIMA G3",
  "280 PLUS 4WD",
  "251",
  "485 4WD",
  "485 SUPER+ 4WD",
  "650 PRIMA G3",
  "650 4WD PRIMA G3",
  "485 AT",
  "450",
  "450 4WD",
  "450 PRIMA G3",
  "450 4WD PRIMA G3"
];