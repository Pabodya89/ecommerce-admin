require('dotenv').config();
const express         = require('express');
const AdminJSExpress  = require('@adminjs/express');
const bcrypt          = require('bcryptjs');
const { sequelize, User } = require('./src/models');
const adminJs         = require('./src/admin');
const authRoutes      = require('./src/routes/auth');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', authRoutes);

// Health check — useful for deployment
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// AdminJS — session-based auth (separate from JWT)
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  adminJs,
  {
    authenticate: async (email, password) => {
      const user = await User.findOne({ where: { email } });
      if (!user) return null;
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return null;
      // Return this object — it becomes `currentAdmin` in all AdminJS hooks
      return { id: user.id, email: user.email, role: user.role, name: user.name };
    },
    cookieName:     'adminjs_session',
    cookiePassword: process.env.JWT_SECRET,
  },
  null,
  { resave: false, saveUninitialized: false }
);

app.use(adminJs.options.rootPath, adminRouter);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong.' });
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(async () => {
  // Auto-create admin on first run (not for seed script)
  const exists = await User.findOne({ where: { email: process.env.ADMIN_EMAIL } });
  if (!exists) {
    await User.create({
      name: 'Admin', email: process.env.ADMIN_EMAIL,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10), role: 'admin',
    });
  }
  app.listen(PORT, () => {
    console.log(`Server:    http://localhost:${PORT}`);
    console.log(`Admin UI:  http://localhost:${PORT}/admin`);
    console.log(`API:       http://localhost:${PORT}/api/login`);
  });
});