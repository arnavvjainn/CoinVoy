# Personal Finance Backend

A TypeScript-based backend application that integrates with Plaid to fetch and analyze user's financial data.

## Features

- User authentication (register/login)
- Plaid integration for bank account linking
- Transaction history retrieval
- Account balance information
- Daily, weekly, monthly, and annual expenditure analysis

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Plaid Developer Account

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/personal-finance
   JWT_SECRET=your_jwt_secret_key
   PLAID_CLIENT_ID=your_plaid_client_id
   PLAID_SECRET=your_plaid_secret
   PLAID_ENV=sandbox
   ```

4. Build the application:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

For development with hot-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Plaid Integration
- `POST /api/plaid/create-link-token` - Create a Plaid link token
- `POST /api/plaid/exchange-public-token` - Exchange public token for access token
- `GET /api/plaid/transactions` - Get user's transactions
- `GET /api/plaid/accounts` - Get user's accounts

## Development

The application is built with:
- TypeScript
- Express.js
- MongoDB with Mongoose
- Plaid API
- JWT for authentication

## Security

- All sensitive routes are protected with JWT authentication
- Passwords are hashed using bcrypt
- Environment variables are used for sensitive configuration
- CORS is enabled for secure cross-origin requests 