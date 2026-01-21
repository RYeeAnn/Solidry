import { ProgrammingLanguage, SOLIDPrinciple } from '@/types';

/**
 * Test fixture structure for SOLID principle violations
 */
export interface SOLIDFixture {
  name: string;
  description: string;
  code: string;
  language: ProgrammingLanguage;
  expectedIssues: Array<{
    principle: SOLIDPrinciple;
    severity: 'critical' | 'warning' | 'suggestion';
    minCount: number;
    pattern?: string; // What to look for in the issue message
  }>;
}

/**
 * Single Responsibility Principle (SRP) Violations
 * Functions/classes doing too many things
 */
export const srpViolations: SOLIDFixture[] = [
  {
    name: 'Multi-responsibility function',
    description: 'Function handles user creation, email sending, and analytics',
    code: `
function createUser(name: string, email: string, password: string) {
  // Database operations
  const user = database.insert('users', { name, email, password });

  // Email sending
  const emailService = new EmailService();
  emailService.sendWelcomeEmail(email, name);

  // Analytics tracking
  analytics.track('user_created', { userId: user.id, timestamp: Date.now() });

  // Logging
  logger.info(\`User created: \${user.id}\`);
  console.log('New user:', user);

  // Cache update
  cache.set(\`user:\${user.id}\`, user);

  return user;
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        principle: 'SRP',
        severity: 'critical',
        minCount: 1,
        pattern: 'multiple responsibilities',
      },
    ],
  },
  {
    name: 'God class',
    description: 'Class with too many responsibilities',
    code: `
class UserManager {
  // Database operations
  saveUser(user: User) { /* ... */ }
  deleteUser(id: string) { /* ... */ }

  // Authentication
  login(email: string, password: string) { /* ... */ }
  logout(userId: string) { /* ... */ }

  // Email operations
  sendWelcomeEmail(user: User) { /* ... */ }
  sendPasswordResetEmail(email: string) { /* ... */ }

  // Validation
  validateEmail(email: string) { /* ... */ }
  validatePassword(password: string) { /* ... */ }

  // Analytics
  trackUserActivity(userId: string, action: string) { /* ... */ }
  generateUserReport(userId: string) { /* ... */ }
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        principle: 'SRP',
        severity: 'critical',
        minCount: 1,
        pattern: 'too many',
      },
    ],
  },
];

/**
 * Open/Closed Principle (OCP) Violations
 * Code not open for extension but requires modification
 */
export const ocpViolations: SOLIDFixture[] = [
  {
    name: 'If-else chain for report types',
    description: 'Adding new report type requires modifying this function',
    code: `
class ReportGenerator {
  generateReport(type: string, data: any): string {
    if (type === 'pdf') {
      const pdf = new PDFDocument();
      pdf.addPage();
      pdf.text(data);
      return pdf.output();
    } else if (type === 'excel') {
      const excel = new ExcelDocument();
      excel.addSheet('Data');
      excel.writeData(data);
      return excel.save();
    } else if (type === 'csv') {
      return data.map((row: any) => row.join(',')).join('\\n');
    } else if (type === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (type === 'xml') {
      return \`<data>\${data}</data>\`;
    }
    throw new Error('Unknown report type');
  }
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        principle: 'OCP',
        severity: 'critical',
        minCount: 1,
        pattern: 'if-else|switch|polymorphism',
      },
    ],
  },
  {
    name: 'Hard-coded notification channels',
    description: 'Cannot add new notification channels without modifying code',
    code: `
function sendNotification(channel: string, message: string, recipient: string) {
  if (channel === 'email') {
    const emailClient = new EmailClient();
    emailClient.send(recipient, 'Notification', message);
  } else if (channel === 'sms') {
    const smsClient = new SMSClient();
    smsClient.send(recipient, message);
  } else if (channel === 'push') {
    const pushClient = new PushNotificationClient();
    pushClient.send(recipient, message);
  }
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        principle: 'OCP',
        severity: 'warning',
        minCount: 1,
        pattern: 'extensible|modification',
      },
    ],
  },
];

/**
 * Liskov Substitution Principle (LSP) Violations
 * Subtypes cannot substitute base types
 */
export const lspViolations: SOLIDFixture[] = [
  {
    name: 'Penguin cannot fly',
    description: 'Subclass throws exception for base class method',
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
  bird.fly(); // Works for Bird, fails for Penguin
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        principle: 'LSP',
        severity: 'critical',
        minCount: 1,
        pattern: 'exception|inheritance|substitute',
      },
    ],
  },
  {
    name: 'Rectangle-Square problem',
    description: 'Square violates Rectangle behavior expectations',
    code: `
class Rectangle {
  constructor(protected width: number, protected height: number) {}

  setWidth(width: number) {
    this.width = width;
  }

  setHeight(height: number) {
    this.height = height;
  }

  getArea(): number {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  setWidth(width: number) {
    this.width = width;
    this.height = width; // Violates Rectangle's independent width/height
  }

  setHeight(height: number) {
    this.width = height;
    this.height = height;
  }
}

function testRectangle(rect: Rectangle) {
  rect.setWidth(5);
  rect.setHeight(10);
  // Expects area to be 50, but Square will give 100
  console.log(rect.getArea());
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        principle: 'LSP',
        severity: 'critical',
        minCount: 1,
      },
    ],
  },
  {
    name: 'Type checking subclass',
    description: 'Need to check type before using, violates LSP',
    code: `
class Animal {
  makeSound(): void {
    console.log('Some sound');
  }
}

class Dog extends Animal {
  makeSound(): void {
    console.log('Woof!');
  }

  fetch(): void {
    console.log('Fetching...');
  }
}

function handleAnimal(animal: Animal) {
  if (animal instanceof Dog) {
    // Type checking needed - LSP violation
    animal.fetch();
  }
  animal.makeSound();
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        principle: 'LSP',
        severity: 'warning',
        minCount: 1,
        pattern: 'instanceof|type check',
      },
    ],
  },
];

/**
 * Interface Segregation Principle (ISP) Violations
 * Fat interfaces forcing implementations of unused methods
 */
export const ispViolations: SOLIDFixture[] = [
  {
    name: 'Fat interface',
    description: 'Interface with too many methods, clients use only a subset',
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
  eat() { console.log('Eating'); }
  sleep() { console.log('Sleeping'); }
  code() { console.log('Coding'); }
  design() { console.log('Designing'); }
  test() { console.log('Testing'); }
  deploy() { throw new Error('Not my job'); }
  review() { console.log('Reviewing'); }
  document() { throw new Error('Nobody does this'); }
  meeting() { console.log('In meeting'); }
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        principle: 'ISP',
        severity: 'critical',
        minCount: 1,
        pattern: 'interface|methods|unused',
      },
    ],
  },
  {
    name: 'Database interface with unused methods',
    description: 'Read-only client forced to implement write methods',
    code: `
interface Database {
  read(query: string): any[];
  write(query: string): void;
  update(query: string): void;
  delete(query: string): void;
  beginTransaction(): void;
  commit(): void;
  rollback(): void;
}

class ReadOnlyDatabase implements Database {
  read(query: string): any[] {
    return []; // Only this is used
  }

  // All these are unused but required by interface
  write(query: string): void {
    throw new Error('Read-only database');
  }

  update(query: string): void {
    throw new Error('Read-only database');
  }

  delete(query: string): void {
    throw new Error('Read-only database');
  }

  beginTransaction(): void {
    throw new Error('Not supported');
  }

  commit(): void {
    throw new Error('Not supported');
  }

  rollback(): void {
    throw new Error('Not supported');
  }
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        principle: 'ISP',
        severity: 'critical',
        minCount: 1,
        pattern: 'interface|unused|not supported',
      },
    ],
  },
];

/**
 * Dependency Inversion Principle (DIP) Violations
 * High-level modules depending on low-level modules directly
 */
export const dipViolations: SOLIDFixture[] = [
  {
    name: 'Direct instantiation of dependencies',
    description: 'Service directly creates concrete dependencies',
    code: `
class UserService {
  constructor() {
    // Direct instantiation - violates DIP
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
    expectedIssues: [
      {
        principle: 'DIP',
        severity: 'critical',
        minCount: 1,
        pattern: 'instantiation|dependency injection|abstraction',
      },
    ],
  },
  {
    name: 'Tight coupling to concrete implementation',
    description: 'High-level policy depends on low-level details',
    code: `
class OrderProcessor {
  processOrder(order: Order) {
    // Directly using concrete MySQL class
    const mysql = new MySQL();
    mysql.connect('localhost', 'root', 'password');
    mysql.execute(\`INSERT INTO orders VALUES (...)\`);

    // Directly using concrete SMTP class
    const smtp = new SMTPClient();
    smtp.connect('smtp.gmail.com', 587);
    smtp.send(order.customerEmail, 'Order Confirmation');

    // Directly using concrete PayPal class
    const paypal = new PayPalAPI();
    paypal.authenticate('api-key');
    paypal.charge(order.total, order.paymentMethod);
  }
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        principle: 'DIP',
        severity: 'critical',
        minCount: 1,
        pattern: 'coupling|abstraction|interface',
      },
    ],
  },
  {
    name: 'No abstraction layer',
    description: 'Business logic mixed with implementation details',
    code: `
function processPayment(amount: number, cardNumber: string) {
  // Direct dependency on implementation details
  const stripe = new Stripe('sk_test_...');

  const charge = stripe.charges.create({
    amount: amount * 100,
    currency: 'usd',
    source: cardNumber,
  });

  // Cannot switch to different payment provider without changing this code
  if (charge.status === 'succeeded') {
    return true;
  }
  return false;
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        principle: 'DIP',
        severity: 'warning',
        minCount: 1,
        pattern: 'abstraction|depend',
      },
    ],
  },
];

/**
 * All SOLID violation fixtures combined
 */
export const allSOLIDViolations: SOLIDFixture[] = [
  ...srpViolations,
  ...ocpViolations,
  ...lspViolations,
  ...ispViolations,
  ...dipViolations,
];

/**
 * Helper to get fixtures by principle
 */
export function getFixturesByPrinciple(principle: SOLIDPrinciple): SOLIDFixture[] {
  return allSOLIDViolations.filter((fixture) =>
    fixture.expectedIssues.some((issue) => issue.principle === principle)
  );
}
