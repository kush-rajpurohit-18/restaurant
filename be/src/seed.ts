import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'appetizers' }, update: {}, create: { name: 'Appetizers', slug: 'appetizers', sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'main-course' }, update: {}, create: { name: 'Main Course', slug: 'main-course', sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'desserts' }, update: {}, create: { name: 'Desserts', slug: 'desserts', sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: 'beverages' }, update: {}, create: { name: 'Beverages', slug: 'beverages', sortOrder: 4 } }),
  ]);

  const [appetizers, mainCourse, desserts, beverages] = categories;

  // Seed menu items
  const menuItems = [
    { name: 'Spring Rolls', description: 'Crispy vegetable spring rolls served with sweet chili sauce', price: 8.99, categoryId: appetizers.id, preparationTime: 10, isVegetarian: true, isVegan: true, imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400', stock: null },
    { name: 'Chicken Wings', description: 'Crispy buffalo wings with ranch dipping sauce', price: 12.99, categoryId: appetizers.id, preparationTime: 15, imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400', stock: null },
    { name: 'Bruschetta', description: 'Toasted bread with tomatoes, basil, and garlic', price: 9.99, categoryId: appetizers.id, preparationTime: 8, isVegetarian: true, isVegan: true, imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400', stock: null },
    { name: 'Grilled Salmon', description: 'Atlantic salmon with lemon butter sauce and seasonal vegetables', price: 24.99, categoryId: mainCourse.id, preparationTime: 20, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', stock: null },
    { name: 'Beef Burger', description: 'Juicy beef patty with lettuce, tomato, and special sauce', price: 16.99, categoryId: mainCourse.id, preparationTime: 15, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', stock: 20 },
    { name: 'Margherita Pizza', description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil', price: 18.99, categoryId: mainCourse.id, preparationTime: 20, isVegetarian: true, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', stock: null },
    { name: 'Pasta Carbonara', description: 'Creamy pasta with pancetta, eggs, and parmesan', price: 15.99, categoryId: mainCourse.id, preparationTime: 15, imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400', stock: null },
    { name: 'Veggie Bowl', description: 'Quinoa bowl with roasted vegetables and tahini dressing', price: 14.99, categoryId: mainCourse.id, preparationTime: 12, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', stock: null },
    { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center, served with vanilla ice cream', price: 8.99, categoryId: desserts.id, preparationTime: 12, isVegetarian: true, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', stock: null },
    { name: 'Tiramisu', description: 'Classic Italian dessert with espresso and mascarpone', price: 7.99, categoryId: desserts.id, preparationTime: 5, isVegetarian: true, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', stock: null },
    { name: 'Fresh Lemonade', description: 'Hand-squeezed lemonade with mint', price: 4.99, categoryId: beverages.id, preparationTime: 3, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400', stock: null },
    { name: 'Craft Beer', description: 'Selection of local craft beers', price: 6.99, categoryId: beverages.id, preparationTime: 2, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', stock: null },
    { name: 'Cappuccino', description: 'Italian espresso with steamed milk foam', price: 4.49, categoryId: beverages.id, preparationTime: 5, isVegetarian: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400', stock: null },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.menuItem.create({ data: item });
    }
  }

  // Add add-ons to Beef Burger
  const burger = await prisma.menuItem.findFirst({ where: { name: 'Beef Burger' } });
  if (burger) {
    const addOns = [
      { name: 'Extra Cheese', price: 1.50, menuItemId: burger.id },
      { name: 'Bacon', price: 2.00, menuItemId: burger.id },
      { name: 'Avocado', price: 2.50, menuItemId: burger.id },
    ];
    for (const addOn of addOns) {
      const exists = await prisma.addOn.findFirst({ where: { name: addOn.name, menuItemId: burger.id } });
      if (!exists) await prisma.addOn.create({ data: addOn });
    }
  }

  // Add add-ons to Pizza
  const pizza = await prisma.menuItem.findFirst({ where: { name: 'Margherita Pizza' } });
  if (pizza) {
    const addOns = [
      { name: 'Extra Mozzarella', price: 1.50, menuItemId: pizza.id },
      { name: 'Mushrooms', price: 1.00, menuItemId: pizza.id },
      { name: 'Pepperoni', price: 2.00, menuItemId: pizza.id },
    ];
    for (const addOn of addOns) {
      const exists = await prisma.addOn.findFirst({ where: { name: addOn.name, menuItemId: pizza.id } });
      if (!exists) await prisma.addOn.create({ data: addOn });
    }
  }

  // Seed users
  const customerHash = await bcrypt.hash('customer123', 10);
  const kitchenHash = await bcrypt.hash('kitchen123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({ where: { email: 'customer@example.com' }, update: {}, create: { email: 'customer@example.com', name: 'John Customer', passwordHash: customerHash, role: 'CUSTOMER' } });
  await prisma.user.upsert({ where: { email: 'kitchen@example.com' }, update: {}, create: { email: 'kitchen@example.com', name: 'Chef Kitchen', passwordHash: kitchenHash, role: 'KITCHEN' } });
  await prisma.user.upsert({ where: { email: 'admin@example.com' }, update: {}, create: { email: 'admin@example.com', name: 'Admin User', passwordHash: adminHash, role: 'ADMIN' } });

  console.log('Database seeded successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
