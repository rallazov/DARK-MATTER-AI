const swaggerJSDoc = require('swagger-jsdoc');

function buildOpenApiSpec() {
  return swaggerJSDoc({
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'PrivacyVault AI API',
        version: '1.0.0',
        description: 'Privacy-first multimodal SaaS monolith API.'
      },
      servers: [{ url: 'http://localhost:8080' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }],
      paths: {
        '/api/health': {
          get: {
            summary: 'Service health',
            responses: { 200: { description: 'Health status' } }
          }
        },
        '/api/auth/magic-link/request': {
          post: {
            summary: 'Request magic link login',
            responses: { 200: { description: 'Magic link sent' } }
          }
        },
        '/api/auth/magic-link/verify': {
          post: {
            summary: 'Verify magic link and issue JWTs',
            responses: { 200: { description: 'Session issued' } }
          }
        },
        '/api/vaults': {
          get: { summary: 'List user vaults', responses: { 200: { description: 'Vault list' } } },
          post: { summary: 'Create vault', responses: { 201: { description: 'Vault created' } } }
        },
        '/api/tasks': {
          get: { summary: 'List tasks', responses: { 200: { description: 'Task list' } } },
          post: { summary: 'Create multimodal task', responses: { 201: { description: 'Task created' } } }
        },
        '/api/privacy/export': {
          get: {
            summary: 'Export user data JSON/CSV',
            responses: { 200: { description: 'Data export' } }
          }
        },
        '/api/privacy/reset': {
          post: {
            summary: 'Irreversible vault or account data wipe',
            responses: { 200: { description: 'Reset completed' } }
          }
        },
        '/api/users/privacy-score': {
          get: {
            summary: 'Compute user privacy score and contributing factors',
            responses: { 200: { description: 'Privacy score payload' } }
          }
        },
        '/api/users/security-status': {
          get: {
            summary: 'Return MFA and integration security posture',
            responses: { 200: { description: 'Security status' } }
          }
        },
        '/api/users/activity': {
          get: {
            summary: 'Recent private user activity feed',
            responses: { 200: { description: 'Activity events' } }
          }
        },
        '/api/admin/metrics': {
          get: {
            summary: 'Founder admin anonymized metrics',
            responses: { 200: { description: 'Metrics summary' } }
          }
        }
      }
    },
    apis: []
  });
}

module.exports = { buildOpenApiSpec };
