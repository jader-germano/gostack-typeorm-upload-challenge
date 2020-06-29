// import AppError from '../errors/AppError';

import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<boolean> {
    const transactionRepository = getRepository(Transaction);
    try {
      await transactionRepository.delete(id);
      return true;
    } catch {
      return false;
    }
  }
}

export default DeleteTransactionService;
