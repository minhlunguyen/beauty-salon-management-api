# Beauty Salon Management API

A comprehensive beauty salon management system API built with NestJS framework. This system provides complete functionality for managing beauty salons, including customer management, appointment scheduling, payment processing, and more.

## 🚀 Features

- **Multi-role Authentication System**: Support for customers, salon operators, and therapists/manipulators
- **Appointment Management**: Complete booking and scheduling system
- **Payment Integration**: Secure payment processing with multiple providers
- **Customer Management**: Customer profiles, history, and preferences
- **Salon Management**: Multi-salon support with location-based services
- **Notification System**: Email and SMS notifications for appointments and updates
- **Coupon System**: Integrated promotional and discount management
- **Media Management**: File upload and management with AWS S3 integration
- **Health Check**: Built-in health monitoring endpoints

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Auth0 integration
- **Validation**: Class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **File Storage**: AWS S3
- **Email**: Nodemailer with Handlebars templates
- **SMS**: Twilio integration
- **Testing**: Jest for unit and e2e testing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd beauty-salon-management-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file based on the `.env.example` template:

```bash
cp .env.example .env
```

Update the environment variables with your specific configuration:

```env
# Application Configuration
APP_ENV=development
PORT=5000
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/beauty-salon

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_TOKEN_EXPIRES_IN=1d

# Add other required environment variables...
```

### 4. Start Required Services

Start MongoDB and any other required services using Docker Compose:

```bash
docker-compose up -d
```

### 5. Seed Master Data

Run the seed commands to populate initial data:

```bash
# Create admin operator account
npx nestjs-command seed:operator

# Seed area data
npx nestjs-command seed:area

# Seed symptom data
npx nestjs-command seed:symptom

# Seed feature data
npx nestjs-command seed:feature

# Seed line data
npx nestjs-command seed:line
```

### 6. Start the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

Once the application is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:5000/api-docs`

## 🏗️ Project Structure

```
src/
├── account/           # User account management (customers, operators, therapists)
├── auth/              # Authentication and authorization
├── common/            # Shared utilities, exceptions, and services
├── config/            # Application configuration
├── coupon/            # Coupon and promotion management
├── media/             # File upload and media management
├── medical/           # Medical records and health data
├── notification/      # Email and SMS notification system
├── payment/           # Payment processing integration
├── reservation/       # Appointment booking and management
├── sale/              # Sales and revenue tracking
├── salon/             # Salon management and configuration
├── schedule/          # Scheduling and calendar management
└── health/            # Health check endpoints
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Available Commands

```bash
# Development
npm run start:dev      # Start in development mode
npm run start:debug    # Start in debug mode

# Building
npm run build          # Build the application
npm run start:prod     # Start in production mode

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run format         # Format code with Prettier

# Testing
npm run test           # Run unit tests
npm run test:e2e       # Run e2e tests
npm run test:cov       # Run tests with coverage
```

## 🔐 Authentication

The API uses JWT-based authentication with role-based access control:

- **Customers**: Can book appointments and manage their profile
- **Operators**: Can manage salon operations and view reports
- **Therapists/Manipulators**: Can manage their schedule and view appointments

## 🌍 Internationalization

The system supports multiple languages and can be easily extended to support additional locales. Currently configured for English with timezone support.

## 📱 Mobile App Integration

This API is designed to work seamlessly with mobile applications, providing:
- RESTful API endpoints
- Real-time notifications
- Offline capability support
- Optimized responses for mobile consumption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - Multi-role authentication
  - Appointment management
  - Payment integration
  - Customer and salon management

---

Built with ❤️ using NestJS