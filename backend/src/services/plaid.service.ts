import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export class PlaidService {
  async createLinkToken(userId: string) {
    const request = {
      user: { client_user_id: userId },
      client_name: 'Personal Finance App',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    };

    try {
      const response = await plaidClient.linkTokenCreate(request);
      return response.data;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw error;
    }
  }

  async exchangePublicToken(publicToken: string) {
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });
      return response.data;
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw error;
    }
  }

  async getTransactions(accessToken: string, startDate: string, endDate: string) {
    try {
      const response = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getAccounts(accessToken: string) {
    try {
      const response = await plaidClient.accountsGet({
        access_token: accessToken,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

} 