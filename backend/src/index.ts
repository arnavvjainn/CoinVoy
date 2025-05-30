import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { AuthController } from './controllers/auth.controller';
import { PlaidController } from './controllers/plaid.controller';
import { authMiddleware } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-finance')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Controllers
const authController = new AuthController();
const plaidController = new PlaidController();

// Routes
app.post('/api/auth/register', authController.register.bind(authController));
app.post('/api/auth/login', authController.login.bind(authController));

// Protected routes
app.post('/api/plaid/create-link-token', authMiddleware, plaidController.createLinkToken.bind(plaidController));
app.post('/api/plaid/exchange-public-token', authMiddleware, plaidController.exchangePublicToken.bind(plaidController));
app.get('/api/plaid/transactions', authMiddleware, plaidController.getTransactions.bind(plaidController));
app.get('/api/plaid/accounts', authMiddleware, plaidController.getAccounts.bind(plaidController));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 