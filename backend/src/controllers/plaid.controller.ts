import { Request, Response } from 'express';
import { PlaidService } from '../services/plaid.service';
import { User } from '../models/user.model';
import moment from 'moment';

export class PlaidController {
  private plaidService: PlaidService;

  constructor() {
    this.plaidService = new PlaidService();
  }

  async createLinkToken(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const linkToken = await this.plaidService.createLinkToken(userId);
      res.json(linkToken);
    } catch (error) {
      console.error('Error creating link token:', error);
      res.status(500).json({ message: 'Error creating link token' });
    }
  }

  async exchangePublicToken(req: Request, res: Response) {
    try {
      const { publicToken, institutionId, institutionName } = req.body;
      const userId = (req as any).user.userId;

      const exchangeResponse = await this.plaidService.exchangePublicToken(publicToken);
      const { access_token, item_id } = exchangeResponse;

      // Save the access token and item ID to the user's document
      await User.findByIdAndUpdate(userId, {
        $push: {
          plaidItems: {
            accessToken: access_token,
            itemId: item_id,
            institutionId,
            institutionName,
          },
        },
      });

      res.json({ message: 'Successfully linked bank account' });
    } catch (error) {
      console.error('Error exchanging public token:', error);
      res.status(500).json({ message: 'Error linking bank account' });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { startDate, endDate } = req.query;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const transactions = [];
      for (const item of user.plaidItems) {
        const plaidTransactions = await this.plaidService.getTransactions(
          item.accessToken,
          startDate as string,
          endDate as string
        );
        transactions.push(...plaidTransactions.transactions);
      }

      // Group transactions by date
      const groupedTransactions = transactions.reduce((acc: any, transaction) => {
        const date = transaction.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
      }, {});

      res.json({
        transactions: groupedTransactions,
        total: transactions.length,
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Error fetching transactions' });
    }
  }

  async getAccounts(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const accounts = [];
      for (const item of user.plaidItems) {
        const plaidAccounts = await this.plaidService.getAccounts(item.accessToken);
        accounts.push(...plaidAccounts.accounts);
      }

      res.json({ accounts });
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ message: 'Error fetching accounts' });
    }
  }

  async getTransactionSummary(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get today's, week's, month's, and YTD date ranges
      const today = moment().format('YYYY-MM-DD');
      const startOfWeek = moment().startOf('week').format('YYYY-MM-DD');
      const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
      const startOfYear = moment().startOf('year').format('YYYY-MM-DD');

      let daySpend = 0, weekSpend = 0, monthSpend = 0, ytdSpend = 0;

      // Loop through all Plaid items (accounts)
      for (const item of user.plaidItems) {
        // Fetch all transactions from start of year to today (covers all periods)
        const transactions = await this.plaidService.getTransactions(
          item.accessToken,
          startOfYear,
          today
        );

        for (const txn of transactions.transactions) {
          const txnDate = txn.date;
          const amount = Math.abs(txn.amount); // Ensure positive spend

          // Only count outflow transactions (e.g., 'debit')
          if (txn.amount < 0) continue;

          if (txnDate === today) daySpend += amount;
          if (txnDate >= startOfWeek) weekSpend += amount;
          if (txnDate >= startOfMonth) monthSpend += amount;
          if (txnDate >= startOfYear) ytdSpend += amount;
        }
      }

      res.json({
        day: daySpend,
        week: weekSpend,
        month: monthSpend,
        ytd: ytdSpend,
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({ message: 'Error fetching summary' });
    }
  }
} 