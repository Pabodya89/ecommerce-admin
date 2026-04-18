require('dotenv').config();
const bcrypt   = require('bcryptjs');
const { sequelize, User, Category, Product, Order, OrderItem, Setting } = require('../models');

async function data() {
  await sequelize.sync({ force: true });
  console.log('Tables created.');

  // ── Users ────────────────────────────────
  const [, alice, bob] = await User.bulkCreate([
    { name: 'Admin',      email: process.env.ADMIN_EMAIL,  password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10), role: 'admin' },
    { name: 'Alice Chen', email: 'alice@example.com',      password: await bcrypt.hash('alice1234', 10), role: 'user' },
    { name: 'Bob Smith',  email: 'bob@example.com',        password: await bcrypt.hash('bob1234',   10), role: 'user' },
  ]);

  // ── Categories ───────────────────────────
  const electronics = await Category.create({ name: 'Electronics', slug: 'electronics' });
  const clothing    = await Category.create({ name: 'Clothing',    slug: 'clothing' });

  // Subcategories
  const phones  = await Category.create({ name: 'Phones',  slug: 'phones',  parentId: electronics.id });
  const laptops = await Category.create({ name: 'Laptops', slug: 'laptops', parentId: electronics.id });

  // ── Products ─────────────────────────────
  const [iphone, macbook, tshirt, airpods] = await Product.bulkCreate([
    { name: 'iPhone 15 Pro',  slug: 'iphone-15-pro',  price: 999.99,  comparePrice: 1099.99, stock: 30,  sku: 'APPL-IP15P', CategoryId: phones.id,  description: '6.1-inch Super Retina XDR' },
    { name: 'MacBook Pro M3', slug: 'macbook-pro-m3', price: 1999.99, comparePrice: 2199.99, stock: 12,  sku: 'APPL-MBP-M3', CategoryId: laptops.id, description: '14-inch, Apple M3 chip' },
    { name: 'Classic Tee',    slug: 'classic-tee',    price: 29.99,   comparePrice: null,    stock: 200, sku: 'CLT-TEE-001', CategoryId: clothing.id, description: '100% cotton, unisex' },
    { name: 'AirPods Pro',    slug: 'airpods-pro',    price: 249.99,  comparePrice: 279.99,  stock: 45,  sku: 'APPL-APP-2',  CategoryId: electronics.id, description: 'Active Noise Cancellation' },
  ]);

  // ── Orders ───────────────────────────────
  const order1 = await Order.create({
    UserId: alice.id, status: 'delivered',
    totalAmount: 1249.98, taxAmount: 100, discountAmount: 0,
    shippingAddress: JSON.stringify({ street: '123 Main St', city: 'New York', country: 'US', zip: '10001' }),
  });
  await OrderItem.bulkCreate([
    { OrderId: order1.id, ProductId: iphone.id,  quantity: 1, unitPrice: 999.99, totalPrice: 999.99 },
    { OrderId: order1.id, ProductId: tshirt.id,  quantity: 2, unitPrice: 29.99,  totalPrice: 59.98  },
    { OrderId: order1.id, ProductId: airpods.id, quantity: 1, unitPrice: 249.99, totalPrice: 249.99 },
  ]);

  const order2 = await Order.create({
    UserId: bob.id, status: 'processing',
    totalAmount: 1999.99, taxAmount: 160, discountAmount: 50,
    shippingAddress: JSON.stringify({ street: '456 Oak Ave', city: 'London', country: 'UK', zip: 'SW1A 1AA' }),
  });
  await OrderItem.create({
    OrderId: order2.id, ProductId: macbook.id, quantity: 1, unitPrice: 1999.99, totalPrice: 1999.99,
  });

  // ── Settings ─────────────────────────────
  await Setting.bulkCreate([
    { key: 'site_name',       value: 'My eCommerce Store', group: 'general',  description: 'Store display name' },
    { key: 'currency',        value: 'USD',                group: 'general',  description: 'Default currency code' },
    { key: 'tax_rate',        value: '0.08',               group: 'general',  description: 'Tax rate as decimal' },
    { key: 'orders_per_page', value: '20',                 group: 'general',  description: 'Admin orders page size' },
    { key: 'low_stock_alert', value: '10',                 group: 'inventory',description: 'Alert threshold for low stock' },
    { key: 'smtp_host',       value: 'smtp.mailgun.org',   group: 'email',    description: 'Email server host' },
    { key: 'support_email',   value: 'support@store.com',  group: 'email',    description: 'Customer support email' },
  ]);

  console.log('\nSeed complete!');
  console.log('Admin login:    ', process.env.ADMIN_EMAIL, '/', process.env.ADMIN_PASSWORD);
  console.log('Regular user 1: alice@example.com / alice1234');
  console.log('Regular user 2: bob@example.com   / bob1234');
  process.exit(0);
}

data().catch(e => { console.error(e); process.exit(1); });