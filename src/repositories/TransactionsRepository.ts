import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions.reduce((next, transaction) => {
      if (transaction.type === 'income') {
        return next + transaction.value;
      }
      return next;
    }, 0);
    const total = income;
    const outcome = transactions.reduce((next, transaction) => {
      if (transaction.type === 'outcome') {
        return next + transaction.value;
      }
      return next;
    }, 0);

    return {
      total: await (total - outcome),
      income,
      outcome,
    } as Balance;
  }
}

export default TransactionsRepository;
