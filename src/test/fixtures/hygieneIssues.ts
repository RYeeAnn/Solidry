import { ProgrammingLanguage } from '@/types';

/**
 * Test fixture structure for code hygiene issues
 */
export interface HygieneFixture {
  name: string;
  description: string;
  code: string;
  language: ProgrammingLanguage;
  expectedIssues: Array<{
    category: 'hygiene';
    severity: 'critical' | 'warning' | 'suggestion';
    minCount: number;
    pattern?: string;
  }>;
}

export const hygieneViolations: HygieneFixture[] = [
  {
    name: 'Console.log statements',
    description: 'Debug console.log statements left in code',
    code: `
function processUser(user: any) {
  console.log('Processing user:', user);
  console.log('User ID:', user.id);

  const result = doSomething(user);
  console.log('Result:', result);

  return result;
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'hygiene',
        severity: 'warning',
        minCount: 3,
        pattern: 'console.log',
      },
    ],
  },
  {
    name: 'Use of any type',
    description: 'TypeScript any type reduces type safety',
    code: `
function handleData(data: any) {
  const user: any = data.user;
  const config: any = loadConfig();

  return processStuff(data, user, config);
}

class DataProcessor {
  process(input: any): any {
    return input;
  }
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'hygiene',
        severity: 'suggestion',
        minCount: 3,
        pattern: 'any',
      },
    ],
  },
  {
    name: 'Var keyword usage',
    description: 'Using var instead of let/const',
    code: `
function oldSchoolCode() {
  var x = 10;
  var name = 'test';
  var data = fetchData();

  for (var i = 0; i < 10; i++) {
    var temp = i * 2;
    console.log(temp);
  }

  return data;
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'hygiene',
        severity: 'suggestion',
        minCount: 5,
        pattern: 'var',
      },
    ],
  },
  {
    name: 'TODO comments without context',
    description: 'TODO comments missing issue references',
    code: `
function calculateTotal(items: Item[]) {
  // TODO: fix this
  let total = 0;

  // TODO: optimize
  for (const item of items) {
    total += item.price;
  }

  // TODO: handle discounts
  return total;
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'hygiene',
        severity: 'suggestion',
        minCount: 3,
        pattern: 'TODO',
      },
    ],
  },
  {
    name: 'Long parameter list',
    description: 'Function with too many parameters',
    code: `
function createUser(
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  zip: string,
  country: string,
  age: number,
  gender: string
) {
  // Function implementation
  return { firstName, lastName, email, phone };
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'hygiene',
        severity: 'warning',
        minCount: 1,
        pattern: 'parameter',
      },
    ],
  },
  {
    name: 'Poor variable names',
    description: 'Non-descriptive variable names',
    code: `
function x(a: number, b: number) {
  const temp = a + b;
  const data = temp * 2;
  const result = data / 3;

  const arr = [1, 2, 3];
  const obj = { x: 1, y: 2 };

  return result;
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'hygiene',
        severity: 'suggestion',
        minCount: 3,
        pattern: 'variable|name',
      },
    ],
  },
  {
    name: 'Magic numbers',
    description: 'Hard-coded numbers without constants',
    code: `
function calculatePrice(quantity: number) {
  if (quantity > 100) {
    return quantity * 9.99 * 0.85; // Magic numbers
  } else if (quantity > 50) {
    return quantity * 9.99 * 0.9;
  }
  return quantity * 9.99;
}

function processData(value: number) {
  return value * 42 + 3.14159;
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'hygiene',
        severity: 'suggestion',
        minCount: 3,
        pattern: 'magic|number|constant',
      },
    ],
  },
  {
    name: 'Commented out code',
    description: 'Commented code blocks that should be removed',
    code: `
function processOrder(order: Order) {
  // const oldWay = calculateOldTotal(order);
  // const deprecatedMethod = legacyProcess(order);

  const newWay = calculateNewTotal(order);

  // if (oldWay !== newWay) {
  //   throw new Error('Mismatch');
  // }

  return newWay;
}

// function legacyProcess(order: Order) {
//   return order.total * 1.1;
// }
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'hygiene',
        severity: 'warning',
        minCount: 1,
        pattern: 'commented',
      },
    ],
  },
  {
    name: 'Missing error handling',
    description: 'Functions without proper error handling',
    code: `
async function fetchUserData(userId: string) {
  // No try-catch
  const response = await fetch(\`/api/users/\${userId}\`);
  const data = await response.json();
  return data;
}

function parseJSON(jsonString: string) {
  // No error handling for invalid JSON
  return JSON.parse(jsonString);
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'hygiene',
        severity: 'warning',
        minCount: 1,
        pattern: 'error|exception|try',
      },
    ],
  },
  {
    name: 'Empty catch blocks',
    description: 'Swallowing exceptions silently',
    code: `
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync('config.json', 'utf-8'));
  } catch (error) {
    // Empty catch - swallowing error
  }
}

async function saveData(data: any) {
  try {
    await database.save(data);
  } catch (error) {
    // Silent failure
  }
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'hygiene',
        severity: 'critical',
        minCount: 2,
        pattern: 'catch|error|silent',
      },
    ],
  },
];

/**
 * Complexity issue fixtures
 */
export interface ComplexityFixture {
  name: string;
  description: string;
  code: string;
  language: ProgrammingLanguage;
  expectedIssues: Array<{
    category: 'complexity';
    severity: 'critical' | 'warning' | 'suggestion';
    minCount: number;
    pattern?: string;
  }>;
}

export const complexityViolations: ComplexityFixture[] = [
  {
    name: 'Deep nesting',
    description: 'Code with excessive nesting levels',
    code: `
function processData(data: any) {
  if (data) {
    if (data.user) {
      if (data.user.profile) {
        if (data.user.profile.settings) {
          if (data.user.profile.settings.notifications) {
            if (data.user.profile.settings.notifications.email) {
              console.log('Email enabled');
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'complexity',
        severity: 'warning',
        minCount: 1,
        pattern: 'nesting|nested',
      },
    ],
  },
  {
    name: 'Long function',
    description: 'Function with too many lines',
    code: `
function processOrder(order: Order) {
  // Validation
  if (!order) throw new Error('Order is null');
  if (!order.items || order.items.length === 0) throw new Error('No items');
  if (!order.customer) throw new Error('No customer');

  // Calculate totals
  let subtotal = 0;
  for (const item of order.items) {
    subtotal += item.price * item.quantity;
  }

  // Apply discounts
  let discount = 0;
  if (order.couponCode) {
    const coupon = getCoupon(order.couponCode);
    if (coupon.type === 'percentage') {
      discount = subtotal * (coupon.value / 100);
    } else {
      discount = coupon.value;
    }
  }

  // Calculate tax
  const taxRate = getTaxRate(order.customer.state);
  const tax = (subtotal - discount) * taxRate;

  // Calculate shipping
  let shipping = 0;
  if (subtotal < 50) {
    shipping = 9.99;
  } else if (subtotal < 100) {
    shipping = 5.99;
  }

  // Calculate total
  const total = subtotal - discount + tax + shipping;

  // Update inventory
  for (const item of order.items) {
    updateInventory(item.productId, -item.quantity);
  }

  // Save order
  const savedOrder = database.save({
    ...order,
    subtotal,
    discount,
    tax,
    shipping,
    total,
    status: 'pending'
  });

  // Send emails
  sendCustomerEmail(order.customer.email, savedOrder);
  sendAdminEmail(savedOrder);

  // Update analytics
  trackOrderPlaced(savedOrder);

  return savedOrder;
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'complexity',
        severity: 'warning',
        minCount: 1,
        pattern: 'long|lines|function',
      },
    ],
  },
  {
    name: 'High cyclomatic complexity',
    description: 'Function with many decision paths',
    code: `
function calculateShipping(order: Order): number {
  if (order.country === 'US') {
    if (order.state === 'CA') {
      if (order.weight > 10) {
        return 15.99;
      } else if (order.weight > 5) {
        return 10.99;
      } else {
        return 5.99;
      }
    } else if (order.state === 'NY') {
      if (order.weight > 10) {
        return 18.99;
      } else {
        return 12.99;
      }
    } else {
      if (order.total > 100) {
        return 0;
      } else {
        return 7.99;
      }
    }
  } else if (order.country === 'CA') {
    if (order.province === 'ON') {
      return 12.99;
    } else {
      return 15.99;
    }
  } else {
    if (order.weight > 10) {
      return 29.99;
    } else {
      return 19.99;
    }
  }
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'complexity',
        severity: 'warning',
        minCount: 1,
        pattern: 'complex|decision|path',
      },
    ],
  },
];

/**
 * Duplicate code fixtures (DRY violations)
 */
export interface DuplicateCodeFixture {
  name: string;
  description: string;
  code: string;
  language: ProgrammingLanguage;
  expectedIssues: Array<{
    category: 'unnecessary';
    severity: 'warning' | 'suggestion';
    minCount: number;
    pattern?: string;
  }>;
}

export const duplicateCodeViolations: DuplicateCodeFixture[] = [
  {
    name: 'Duplicate validation logic',
    description: 'Same validation code repeated multiple times',
    code: `
function createUser(userData: any) {
  if (!userData.email || !userData.email.includes('@')) {
    throw new Error('Invalid email');
  }
  if (userData.password.length < 8) {
    throw new Error('Password too short');
  }
  // Create user
}

function updateUser(userId: string, userData: any) {
  if (!userData.email || !userData.email.includes('@')) {
    throw new Error('Invalid email');
  }
  if (userData.password && userData.password.length < 8) {
    throw new Error('Password too short');
  }
  // Update user
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'unnecessary',
        severity: 'warning',
        minCount: 1,
        pattern: 'duplicate|redundant|shared',
      },
    ],
  },
  {
    name: 'Repeated API calls',
    description: 'Similar API call patterns duplicated',
    code: `
async function getUser(id: string) {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return await response.json();
}

async function getPost(id: string) {
  const response = await fetch(\`/api/posts/\${id}\`);
  if (!response.ok) throw new Error('Failed to fetch post');
  return await response.json();
}

async function getComment(id: string) {
  const response = await fetch(\`/api/comments/\${id}\`);
  if (!response.ok) throw new Error('Failed to fetch comment');
  return await response.json();
}
`,
    language: 'typescript',
    expectedIssues: [
      {
        category: 'unnecessary',
        severity: 'suggestion',
        minCount: 1,
        pattern: 'duplicate|similar|extract',
      },
    ],
  },
];

/**
 * All hygiene and complexity fixtures combined
 */
export const allHygieneAndComplexityFixtures = [
  ...hygieneViolations,
  ...complexityViolations,
  ...duplicateCodeViolations,
];
