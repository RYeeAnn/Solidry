import { ProgrammingLanguage, SOLIDPrinciple } from '@/types';

/**
 * Streamlined test fixtures for portfolio validation
 * One clear, obvious violation per SOLID principle
 */

export interface TestFixture {
  name: string;
  description: string;
  code: string;
  language: ProgrammingLanguage;
  principle: SOLIDPrinciple;
  expectedMinIssues: number;
  shouldDetect: string; // What we expect Claude to catch
}

/**
 * Core SOLID violation fixtures - one per principle
 * These are the "slam dunk" cases that should always be detected
 */
export const coreSOLIDFixtures: TestFixture[] = [
  {
    name: 'SRP Violation - God Function',
    description: 'Function handling database, email, analytics, and logging',
    principle: 'SRP',
    expectedMinIssues: 1,
    shouldDetect: 'Multiple responsibilities in single function',
    code: `
function createUser(name: string, email: string, password: string) {
  // Database operation
  const user = database.insert('users', { name, email, password });

  // Email sending
  const emailService = new EmailService();
  emailService.sendWelcomeEmail(email, name);

  // Analytics tracking
  analytics.track('user_created', { userId: user.id });

  // Logging
  logger.info(\`User created: \${user.id}\`);
  console.log('New user:', user);

  // Cache update
  cache.set(\`user:\${user.id}\`, user);

  return user;
}
`,
    language: 'typescript',
  },
  {
    name: 'OCP Violation - If-Else Chain',
    description: 'Report generator requiring modification for new types',
    principle: 'OCP',
    expectedMinIssues: 1,
    shouldDetect: 'Hard-coded type checking, should use polymorphism',
    code: `
class ReportGenerator {
  generateReport(type: string, data: any): string {
    if (type === 'pdf') {
      const pdf = new PDFDocument();
      return pdf.generate(data);
    } else if (type === 'excel') {
      const excel = new ExcelDocument();
      return excel.generate(data);
    } else if (type === 'csv') {
      return data.map(row => row.join(',')).join('\\n');
    } else if (type === 'json') {
      return JSON.stringify(data);
    }
    throw new Error('Unknown type');
  }
}
`,
    language: 'typescript',
  },
  {
    name: 'LSP Violation - Penguin Cannot Fly',
    description: 'Subclass throws exception for base class method',
    principle: 'LSP',
    expectedMinIssues: 1,
    shouldDetect: 'Subclass violates base class contract by throwing exception',
    code: `
class Bird {
  fly(): void {
    console.log('Flying...');
  }
}

class Penguin extends Bird {
  fly(): void {
    throw new Error('Penguins cannot fly!');
  }
}

function makeBirdFly(bird: Bird): void {
  bird.fly(); // Works for Bird, but fails for Penguin
}
`,
    language: 'typescript',
  },
  {
    name: 'ISP Violation - Fat Interface',
    description: 'Interface with many methods, implementations use only subset',
    principle: 'ISP',
    expectedMinIssues: 1,
    shouldDetect: 'Interface too large, forces unused method implementations',
    code: `
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  code(): void;
  design(): void;
  test(): void;
  deploy(): void;
  review(): void;
  document(): void;
  meeting(): void;
}

class Developer implements Worker {
  work() { this.code(); }
  code() { console.log('Coding'); }

  // Forced to implement unused methods
  eat() { throw new Error('Not tracked'); }
  sleep() { throw new Error('Not tracked'); }
  design() { throw new Error('Not my role'); }
  test() { throw new Error('QA does this'); }
  deploy() { throw new Error('DevOps does this'); }
  review() { throw new Error('Optional'); }
  document() { throw new Error('Nobody does this'); }
  meeting() { throw new Error('Too many meetings'); }
}
`,
    language: 'typescript',
  },
  {
    name: 'DIP Violation - Direct Instantiation',
    description: 'Service directly creates concrete dependencies',
    principle: 'DIP',
    expectedMinIssues: 1,
    shouldDetect: 'Direct instantiation of concrete classes, missing abstraction',
    code: `
class UserService {
  constructor() {
    // Direct instantiation - tightly coupled to implementations
    this.database = new PostgresDatabase();
    this.cache = new RedisCache();
    this.emailService = new SmtpEmailService();
    this.logger = new FileLogger();
  }

  private database: PostgresDatabase;
  private cache: RedisCache;
  private emailService: SmtpEmailService;
  private logger: FileLogger;

  async createUser(userData: any) {
    const user = await this.database.insert('users', userData);
    this.cache.set(\`user:\${user.id}\`, user);
    await this.emailService.sendWelcome(user.email);
    this.logger.log(\`User created: \${user.id}\`);
    return user;
  }
}
`,
    language: 'typescript',
  },
];

/**
 * Core hygiene violations - the obvious ones
 */
export const coreHygieneFixtures: TestFixture[] = [
  {
    name: 'Hygiene Issues - Console.log + var + any',
    description: 'Multiple obvious code quality issues',
    principle: 'other',
    expectedMinIssues: 3,
    shouldDetect: 'console.log statements, var usage, any types',
    code: `
function processData(data: any) {
  console.log('Processing:', data);
  var result = data.value;
  console.log('Result:', result);

  var temp: any = result * 2;
  console.log('Temp:', temp);

  return temp;
}
`,
    language: 'typescript',
  },
];

/**
 * DRY (Don't Repeat Yourself) violation
 */
export const dryViolationFixture: TestFixture = {
  name: 'DRY Violation - Duplicate Logic',
  description: 'Same validation logic repeated in multiple functions',
  principle: 'other',
  expectedMinIssues: 1,
  shouldDetect: 'Duplicate validation logic that should be extracted',
  code: `
function createUser(userData: any) {
  // Duplicate validation
  if (!userData.email || !userData.email.includes('@')) {
    throw new Error('Invalid email');
  }
  if (userData.password.length < 8) {
    throw new Error('Password too short');
  }
  // Create logic
  return database.insert('users', userData);
}

function updateUser(userId: string, userData: any) {
  // Same validation duplicated
  if (!userData.email || !userData.email.includes('@')) {
    throw new Error('Invalid email');
  }
  if (userData.password && userData.password.length < 8) {
    throw new Error('Password too short');
  }
  // Update logic
  return database.update('users', userId, userData);
}
`,
  language: 'typescript',
};

/**
 * Clean code example - should score 90+
 */
export const cleanCodeFixture: TestFixture = {
  name: 'Clean Code - Proper SOLID Design',
  description: 'Well-structured code following SOLID principles',
  principle: 'other',
  expectedMinIssues: 0,
  shouldDetect: 'Should have minimal or no issues',
  code: `
interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
}

interface EmailService {
  sendWelcome(email: string, name: string): Promise<void>;
}

class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string
  ) {}
}

class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(email: string, name: string): Promise<User> {
    const user = new User(
      generateId(),
      email,
      name
    );

    await this.userRepository.save(user);
    await this.emailService.sendWelcome(user.email, user.name);

    return user;
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(7);
}
`,
  language: 'typescript',
};

/**
 * All core fixtures combined for easy iteration
 */
export const allCoreFixtures = [
  ...coreSOLIDFixtures,
  ...coreHygieneFixtures,
  dryViolationFixture,
  cleanCodeFixture,
];

/**
 * Get fixture by principle for targeted testing
 */
export function getFixtureByPrinciple(principle: SOLIDPrinciple): TestFixture | undefined {
  return coreSOLIDFixtures.find(f => f.principle === principle);
}
