# Sample Code for Testing Solidry

Use these code samples to test Solidry's analysis capabilities.

## Example 1: Multiple Issues (Good for Demo)

```typescript
function getUserData(id: any, name: string, email: string, phone: string) {
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
}
```

**Expected Issues:**
- Use of `any` type
- Console.log statements
- Long parameter list
- String concatenation for URLs
- SRP violation (multiple responsibilities)
- DIP violation (direct instantiation)

## Example 2: SOLID Violations

```typescript
class ReportGenerator {
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
      return data.map(row => row.join(',')).join('\n');
    }
  }
}
```

**Expected Issues:**
- OCP violation (not open for extension, requires modification for new types)
- Large if-else chain that should use polymorphism
- Use of `any` type

## Example 3: Clean Code (Should Score Well)

```typescript
interface UserRepository {
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
}
```

**Expected Issues:**
- Should have minimal or no issues
- Good separation of concerns
- Follows SRP
- Uses dependency injection
- Proper TypeScript typing

## Example 4: Code Hygiene Issues

```javascript
function x(a, b, c, d, e, f) {
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
}
```

**Expected Issues:**
- Non-descriptive variable names (x, a, b, temp, data)
- Deep nesting
- Magic number (42)
- Commented-out code
- TODO without context
- Console.log statement

## How to Test

1. Copy any of the code examples above
2. Go to [http://localhost:3000/review](http://localhost:3000/review)
3. Paste the code
4. Select review types (try "SOLID Principles" + "Code Hygiene")
5. Click "Analyze Code"
6. Review the results

## Testing with Git Diffs

You can also test with git diff format:

```diff
diff --git a/src/user.ts b/src/user.ts
index 123abc..456def 100644
--- a/src/user.ts
+++ b/src/user.ts
@@ -1,5 +1,10 @@
 function getUser(id: any) {
+  console.log('Getting user:', id);
   const user = database.query('SELECT * FROM users WHERE id = ' + id);
+  if (!user) {
+    throw new Error('Not found');
+  }
   return user;
 }
```

Solidry will analyze only the added lines (marked with `+`).
