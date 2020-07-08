import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';
import CreateTransactionService from '../services/CreateTransactionService';

import TransactionsRepository from '../repositories/TransactionsRepository';
import DeleteTransactionService from '../services/DeleteTransactionService';
import UploadConfig from '../config/UploadConfig';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(UploadConfig);

// GET
transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.getTransactions();
  const balance = await transactionsRepository.getBalance();
  return response.json({ transactions, balance });
});

// POST
transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.json({ delete: 'oks' });
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransaction = new ImportTransactionsService();

    const transactions = await importTransaction.execute(request.file.path);

    const createTransaction = new CreateTransactionService();

    for (const transaction of transactions) {
      await createTransaction.execute({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: transaction.category,
      });
    }

    // MAP FUNCTION WAS NOT PROPERLY WORKING IN SOME SITUATIONS.
    // transactions.map(async transaction => {
    //   const createTransaction = new CreateTransactionService();

    //   await createTransaction.execute({
    //     title: transaction.title,
    //     value: transaction.value,
    //     type: transaction.type,
    //     category: transaction.category,
    //   });
    // });

    return response.json(transactions);
  },
);

export default transactionsRouter;
