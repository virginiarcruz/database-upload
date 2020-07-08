import { EntityRepository, Repository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface CategoryDTO {
  id: string;
  title: string;
}

interface CreateTransactionDTO {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: CategoryDTO;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions = await transactionsRepository.find();
    const income = transactions.reduce((total, transaction) => {
      if (transaction.type === 'income') {
        return total + Number(transaction.value);
      }
      return total;
    }, 0);

    const outcome = transactions.reduce((total, transaction) => {
      if (transaction.type === 'outcome') {
        return total + Number(transaction.value);
      }
      return total;
    }, 0);
    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }

  public async getTransactions(): Promise<CreateTransactionDTO[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions = transactionsRepository.find({
      select: ['id', 'title', 'value', 'type'],
      relations: ['category'],
    });
    return transactions;
  }
}

export default TransactionsRepository;
