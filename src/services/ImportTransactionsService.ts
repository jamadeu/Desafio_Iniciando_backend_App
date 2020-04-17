import csv from 'csvtojson';
import path from 'path';

import fs from 'fs';

import CreateTransactionService from './CreateTransactionService';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';

interface Request {
  fileName: string;
}

class ImportTransactionsService {
  public async execute({ fileName }: Request): Promise<Transaction[]> {
    const file = path.join(uploadConfig.directory, fileName);
    const createTransaction = new CreateTransactionService();

    const data = await csv().fromFile(file);

    const transactions: Transaction[] = [];

    for (const createdTransactions of data) {
      const transaction = await createTransaction.execute(createdTransactions);

      transactions.push(transaction);
    }

    await fs.promises.unlink(file);

    return transactions;
  }
}

export default ImportTransactionsService;
