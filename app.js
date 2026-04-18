require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const ConnectSessionSequelize = require('connect-session-sequelize');
const { sequelize, User } = require('./src/models');
const { buildAdminJS } = require('./src/admin');
const authRoutes = require('./src/routes/auth');

const app = express();

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

// API routes
app.use('/api', express.json());
app.use('/api', express.urlencoded({ extended: true }));
app.use('/api', authRoutes);

// Health check — useful for deployment
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Root route helper for quick navigation
app.get('/', (req, res) => {
  res.json({
    message: 'eCommerce admin backend is running.',
    adminUrl: '/admin',
    adminLogin: '/admin/login',
    loginApi: '/api/login',
    loginApiNote: 'Use POST /api/login with JSON body. UI login page is /admin/login.',
    health: '/health',
  });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  const AdminJSExpress = await import('@adminjs/express');
  const adminJs = await buildAdminJS();

  const SequelizeStore = ConnectSessionSequelize(session.Store);
  const sessionStore = new SequelizeStore({
    db: sequelize,
    tableName: 'Sessions',
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 24 * 60 * 60 * 1000,
  });

  // AdminJS auth is session-based; API auth remains JWT-based under /api.
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
    {
      authenticate: async (email, password) => {
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !password) return null;

        const user = await User.findOne({ where: { email: normalizedEmail } });
        if (!user) return null;
        if (!user.isActive) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, role: user.role, name: user.name };
      },
      cookieName: 'adminjs_session',
      cookiePassword: process.env.JWT_SECRET,
    },
    null,
    {
      secret: process.env.JWT_SECRET,
      name: 'adminjs_session',
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      },
    }
  );

  app.use(adminJs.options.rootPath, adminRouter);

  // 404 handler
  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong.' });
  });

  await sequelize.sync({ alter: true });
  await sessionStore.sync();

  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');

  let adminUser = await User.findOne({
    where: { email: adminEmail },
    paranoid: false,
  });

  if (adminUser) {
    if (adminUser.deletedAt) await adminUser.restore();

    const passwordMatches = await bcrypt.compare(adminPassword, adminUser.password);
    if (!passwordMatches) {
      adminUser.password = await bcrypt.hash(adminPassword, 10);
    }

    adminUser.role = 'admin';
    adminUser.isActive = true;
    await adminUser.save();
  } else {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      role: 'admin',
      isActive: true,
    });
  }

  app.listen(PORT, () => {
    console.log(`Server:    http://localhost:${PORT}`);
    console.log(`Admin UI:  http://localhost:${PORT}/admin`);
    console.log(`API:       http://localhost:${PORT}/api/login`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});