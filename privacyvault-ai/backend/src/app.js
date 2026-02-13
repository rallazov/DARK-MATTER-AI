const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const { env } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { verifyCsrf } = require('./middleware/csrf');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { buildOpenApiSpec } = require('./docs/openapi');

const { authRouter } = require('./modules/auth/auth.routes');
const { usersRouter } = require('./modules/users/users.routes');
const { onboardingRouter } = require('./modules/onboarding/onboarding.routes');
const { vaultsRouter } = require('./modules/vaults/vaults.routes');
const { tasksRouter } = require('./modules/tasks/tasks.routes');
const { botsRouter } = require('./modules/bots/bots.routes');
const { integrationsRouter } = require('./modules/integrations/integrations.routes');
const { analyticsRouter } = require('./modules/analytics/analytics.routes');
const { privacyRouter } = require('./modules/privacy/privacy.routes');
const { auditRouter } = require('./modules/audit/audit.routes');
const { adminRouter } = require('./modules/admin/admin.routes');
const { billingRouter } = require('./modules/billing/billing.routes');
const { healthRouter } = require('./modules/health/health.routes');
const { webhooksRouter } = require('./modules/webhooks/webhooks.routes');

function createApp() {
  const app = express();

  app.set('trust proxy', env.trustProxy);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", env.frontendUrl],
          imgSrc: ["'self'", 'data:', 'https:'],
          mediaSrc: ["'self'", 'https:'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"]
        }
      }
    })
  );

  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use('/api', apiLimiter);

  app.use('/api/auth/refresh', verifyCsrf);
  app.use('/api/auth/logout', verifyCsrf);
  app.use('/api/privacy/reset', verifyCsrf);

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/onboarding', onboardingRouter);
  app.use('/api/vaults', vaultsRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/bots', botsRouter);
  app.use('/api/integrations', integrationsRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/privacy', privacyRouter);
  app.use('/api/audit', auditRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/billing', billingRouter);
  app.use('/api/webhooks', webhooksRouter);

  if (env.enableSwagger) {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(buildOpenApiSpec()));
  }

  const frontendDist = path.resolve(process.cwd(), 'frontend/dist');
  app.use(express.static(frontendDist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(frontendDist, 'index.html'));
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
