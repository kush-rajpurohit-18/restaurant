import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
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
  menuItemId: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  preparationTime: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  stock: number | null;
  addOns: AddOn[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemAddOn {
  id: string;
  orderItemId: string;
  addOnId: string;
  addOn: AddOn;
  price: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem: MenuItem & { category: Category };
  quantity: number;
  unitPrice: number;
  size?: string;
  specialInstructions?: string;
  addOns: OrderItemAddOn[];
}

export interface StatusHistory {
  id: string;
  orderId: string;
  status: string;
  timestamp: Date;
  note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customer: { id: string; name: string; email: string };
  items: OrderItem[];
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentRef?: string;
  statusHistory: StatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Seed data ──────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { id: uuidv4(), name: 'Starters', slug: 'starters', sortOrder: 1 },
  { id: uuidv4(), name: 'Main Course', slug: 'main-course', sortOrder: 2 },
  { id: uuidv4(), name: 'Beverages', slug: 'beverages', sortOrder: 3 },
  { id: uuidv4(), name: 'Desserts', slug: 'desserts', sortOrder: 4 },
];

function buildPlaceholderImageUrl(name: string) {
  return `https://placehold.co/1200x800/f5f5f5/6b7280?text=${encodeURIComponent(name)}`;
}

function makeItem(
  name: string,
  description: string,
  price: number,
  categoryId: string,
  opts: Partial<Omit<MenuItem, 'id' | 'addOns' | 'createdAt' | 'updatedAt'>> = {},
  addOns: Omit<AddOn, 'id' | 'menuItemId'>[] = [],
): MenuItem {
  const id = uuidv4();
  return {
    id,
    name,
    description,
    price,
    imageUrl: buildPlaceholderImageUrl(name),
    categoryId,
    preparationTime: 15,
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    stock: null,
    ...opts,
    addOns: addOns.map(a => ({ ...a, id: uuidv4(), menuItemId: id })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

const [starters, mainCourse, beverages, desserts] = CATEGORIES;

const MENU_ITEMS: MenuItem[] = [
  makeItem('Garlic Bread', 'Toasted bread with garlic butter and herbs', 4.99, starters.id, {
    isVegetarian: true,
    imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=800&auto=format&fit=crop',
  }),
  makeItem('Spring Rolls', 'Crispy veggie spring rolls with sweet chili dipping sauce', 6.49, starters.id, {
    isVegetarian: true,
    isVegan: true,
    imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&auto=format&fit=crop',
  }),
  makeItem('Chicken Wings', 'Spicy buffalo wings with blue cheese dip', 8.99, starters.id, {
    imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&auto=format&fit=crop',
  }, [
    { name: 'Extra Sauce', price: 0.5 },
    { name: 'Extra Cheese Dip', price: 1.0 },
  ]),
  makeItem('Grilled Chicken', 'Herb-marinated grilled chicken with roasted vegetables', 14.99, mainCourse.id, {
    isGlutenFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&auto=format&fit=crop',
  }, [
    { name: 'Extra Veggies', price: 2.0 },
    { name: 'Upgrade to Fries', price: 1.5 },
  ]),
  makeItem('Margherita Pizza', 'Classic tomato sauce with fresh mozzarella and basil', 12.99, mainCourse.id, {
    isVegetarian: true,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop',
  }, [
    { name: 'Extra Cheese', price: 1.5 },
    { name: 'Add Mushrooms', price: 1.0 },
  ]),
  makeItem('Vegan Burger', 'Plant-based patty with lettuce, tomato and vegan mayo', 13.49, mainCourse.id, {
    isVegetarian: true,
    isVegan: true,
    imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&auto=format&fit=crop',
  }),
  makeItem('Pasta Arrabbiata', 'Penne in spicy tomato sauce with garlic and parsley', 11.99, mainCourse.id, {
    isVegetarian: true,
    isVegan: true,
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&auto=format&fit=crop',
  }),
  makeItem('Cola', '330ml can of cola', 2.49, beverages.id, {
    isVegan: true,
    isGlutenFree: true,
    preparationTime: 2,
    imageUrl: 'https://images.unsplash.com/photo-1629203432180-71e9b6a4f25c?w=800&auto=format&fit=crop',
  }),
  makeItem('Fresh Orange Juice', 'Freshly squeezed orange juice', 3.99, beverages.id, {
    isVegan: true,
    isGlutenFree: true,
    preparationTime: 5,
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?w=800&auto=format&fit=crop',
  }),
  makeItem('Sparkling Water', '500ml sparkling mineral water', 1.99, beverages.id, {
    isVegan: true,
    isGlutenFree: true,
    preparationTime: 2,
    imageUrl: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&auto=format&fit=crop',
  }),
  makeItem('Chocolate Lava Cake', 'Warm chocolate cake with molten center and vanilla ice cream', 6.99, desserts.id, {
    isVegetarian: true,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop',
  }),
  makeItem('Fruit Sorbet', 'Seasonal fruit sorbet — ask staff for today\'s flavour', 4.99, desserts.id, {
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop',
  }),
];

// ── Store ──────────────────────────────────────────────────────────────────────

@Injectable()
export class DataStore {
  readonly users: User[] = [];
  readonly categories: Category[] = [...CATEGORIES];
  readonly menuItems: MenuItem[] = [...MENU_ITEMS];
  readonly orders: Order[] = [];
}
