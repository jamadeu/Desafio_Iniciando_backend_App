import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Invalid type');
    }

    const { total } = await transactionRepository.getBalance();
    if (type === 'outcome' && value > total) {
      throw new AppError('You do not have enough balance');
    }

    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });
    let category_id = '';
    if (!categoryExists) {
      const createCategory = new CreateCategoryService();
      const { id } = await createCategory.execute({ title: category });
      category_id = id;
    } else {
      category_id = categoryExists.id;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
