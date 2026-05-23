const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TripMate API',
      version: '1.0.0',
      description: `
## TripMate REST API

Travel smart, spend wisely. Backend API cho ứng dụng quản lý chuyến đi nhóm TripMate.

### Authentication
Sử dụng JWT Bearer Token. Đăng nhập qua \`POST /auth/login\` để lấy token.
      `,
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'https://api.tripmate.app', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            phone: { type: 'string' },
            bio: { type: 'string' },
            location: { type: 'string' },
            bankName: { type: 'string' },
            bankAccount: { type: 'string' },
          },
        },
        Trip: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            description: { type: 'string' },
            destinations: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['UPCOMING', 'ONGOING', 'DONE'] },
            memberCount: { type: 'number' },
            totalCost: { type: 'number' },
            inviteCode: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
