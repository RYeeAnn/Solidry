'use client';

import { ProgrammingLanguage } from '@/types';

interface ExampleCodeSelectorProps {
  onSelectExample: (code: string, language: ProgrammingLanguage) => void;
}

const EXAMPLES = [
  {
    id: 'multiple-issues',
    title: 'Multiple Issues',
    description: 'Good for demo - contains various violations',
    language: 'typescript' as ProgrammingLanguage,
    code: `function getUserData(id: any, name: string, email: string, phone: string) {
  console.log('Fetching user data for:', id);

  const data = fetch('https://api.example.com/users/' + id);

  if (data) {
    console.log('Data found:', data);
    return data;
  } else {
    return null;
  }
}

class UserService {
  constructor() {
    // Direct instantiation - violates DIP
    this.database = new PostgresDatabase();
    this.cache = new RedisCache();
  }

  // Multiple responsibilities - violates SRP
  saveUserAndSendEmail(user, emailTemplate) {
    this.database.save(user);
    this.sendEmail(user.email, emailTemplate);
    this.logActivity(user.id, 'user_created');
    this.updateAnalytics(user);
  }
}`,
  },
  {
    id: 'solid-violations',
    title: 'SOLID Violations',
    description: 'Focuses on SOLID principle violations',
    language: 'typescript' as ProgrammingLanguage,
    code: `class ReportGenerator {
  generateReport(type: string, data: any) {
    if (type === 'pdf') {
      // PDF generation logic
      const pdf = new PDFDocument();
      pdf.addPage();
      return pdf;
    } else if (type === 'excel') {
      // Excel generation logic
      const excel = new ExcelDocument();
      excel.addSheet();
      return excel;
    } else if (type === 'csv') {
      // CSV generation logic
      return data.map(row => row.join(',')).join('\\n');
    }
  }
}`,
  },
  {
    id: 'clean-code',
    title: 'Clean Code',
    description: 'Well-written code - should score high',
    language: 'typescript' as ProgrammingLanguage,
    code: `interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
}

class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string
  ) {}
}

class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userData: { email: string; name: string }): Promise<User> {
    const user = new User(
      generateId(),
      userData.email,
      userData.name
    );

    await this.userRepository.save(user);
    return user;
  }
}`,
  },
  {
    id: 'hygiene-issues',
    title: 'Hygiene Issues',
    description: 'Code quality and hygiene problems',
    language: 'javascript' as ProgrammingLanguage,
    code: `function x(a, b, c, d, e, f) {
  var temp = a + b;
  var data = c + d;
  var result = e + f;

  // TODO: fix this later
  if (temp > 10) {
    if (data > 20) {
      if (result > 30) {
        console.log('nested');
        return 42; // magic number
      }
    }
  }

  // const oldCode = 'this is commented out';
  // const unused = 'also commented';

  return temp + data + result;
}`,
  },
];

export default function ExampleCodeSelector({ onSelectExample }: ExampleCodeSelectorProps) {
  return (
    <div className="panel p-4 space-y-3">
      <div className="text-sm font-medium">Test with Example Code</div>
      <div className="text-xs text-foreground/60 mb-2">
        Select an example to quickly test the analyzer
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example.id}
            onClick={() => onSelectExample(example.code, example.language)}
            className="text-left p-3 border border-border rounded hover:bg-foreground/5 transition-colors"
          >
            <div className="text-sm font-medium">{example.title}</div>
            <div className="text-xs text-foreground/60 mt-1">{example.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
