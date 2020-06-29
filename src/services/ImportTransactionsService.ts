import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In } from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface CsvTransaction {
  title: string;
  value: number;
  type: 'outcome' | 'income';
  category: string;
}

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    const transactionRepository = getRepository(Transaction);
    const { rawTransactions, categories } = await this.loadCsv(path);

    const categoryRepository = getRepository(Category);

    const existentsCategories = await categoryRepository.find({
      where: { title: In(categories) },
    });

    const mapedCategories = existentsCategories.map(
      (category: Category) => category.title,
    );

    const leftToAddCategoriesTitles = categories
      .filter(category => !mapedCategories.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      leftToAddCategoriesTitles.map(title => ({ title })),
    );

    await categoryRepository.save(newCategories);

    const mergedCategories = [...newCategories, ...existentsCategories];

    const importedTransactions = transactionRepository.create(
      rawTransactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: mergedCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(importedTransactions);
    await fs.promises.unlink(path);
    return importedTransactions;
  }

  private async loadCsv(path: string) {
    const readCSVStream = fs.createReadStream(path);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const rawTransactions: CsvTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );
      rawTransactions.push({ title, type, value, category });
      categories.push(category);
    });
    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });
    return { rawTransactions, categories };
  }
}

export default ImportTransactionsService;
