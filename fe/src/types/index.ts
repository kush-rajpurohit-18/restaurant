export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  KITCHEN = 'KITCHEN',
  ADMIN = 'ADMIN',
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: Category;
  categoryId: string;
  preparationTime: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  stock: number | null;
  addOns: AddOn[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedAddOnIds: string[];
  specialInstructions: string;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  size?: string;
  specialInstructions?: string;
  addOns: Array<{ addOn: AddOn; price: number }>;
}

export interface StatusHistory {
  id: string;
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customer: { id: string; name: string; email: string };
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}
