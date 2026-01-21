import { describe, it, expect } from 'vitest';
import { detectLanguage, isGitDiff, isValidCode } from '../languageDetect';

describe('detectLanguage', () => {
  it('should detect TypeScript', () => {
    const code = `
      interface User {
        name: string;
        age: number;
      }

      const user: User = { name: 'John', age: 30 };
    `;
    expect(detectLanguage(code)).toBe('typescript');
  });

  it('should detect JavaScript', () => {
    const code = `
      function hello() {
        const message = "Hello World";
        console.log(message);
      }
    `;
    const result = detectLanguage(code);
    expect(['javascript', 'typescript']).toContain(result);
  });

  it('should detect Python', () => {
    const code = `
      def hello():
          print("Hello World")

      class User:
          def __init__(self, name):
              self.name = name
    `;
    expect(detectLanguage(code)).toBe('python');
  });

  it('should detect Java', () => {
    const code = `
      public class User {
          private String name;

          public User(String name) {
              this.name = name;
          }
      }
    `;
    expect(detectLanguage(code)).toBe('java');
  });

  it('should detect Go', () => {
    const code = `
      package main

      func main() {
          fmt.Println("Hello")
      }

      type User struct {
          Name string
      }
    `;
    expect(detectLanguage(code)).toBe('go');
  });

  it('should return auto for ambiguous code', () => {
    const code = `
      x = 1 + 2
      y = 3 + 4
    `;
    expect(detectLanguage(code)).toBe('auto');
  });
});

describe('isGitDiff', () => {
  it('should detect git diff format', () => {
    const diff = `
diff --git a/src/file.ts b/src/file.ts
index 123abc..456def 100644
--- a/src/file.ts
+++ b/src/file.ts
@@ -1,5 +1,7 @@
 function test() {
+  console.log('new line');
   return true;
 }
    `;
    expect(isGitDiff(diff)).toBe(true);
  });

  it('should not detect regular code as git diff', () => {
    const code = `
      function hello() {
        return 'world';
      }
    `;
    expect(isGitDiff(code)).toBe(false);
  });

  it('should detect minimal git diff markers', () => {
    const diff = 'diff --git a/file.ts b/file.ts';
    expect(isGitDiff(diff)).toBe(true);
  });
});

describe('isValidCode', () => {
  it('should accept valid code', () => {
    const code = `
      function test() {
        return true;
      }
    `;
    expect(isValidCode(code)).toBe(true);
  });

  it('should accept code with special characters', () => {
    const code = `
      const x = 10;
      const y = x * 2;
      if (y > 15) {
        console.log('Greater');
      }
    `;
    expect(isValidCode(code)).toBe(true);
  });

  it('should reject empty strings', () => {
    expect(isValidCode('')).toBe(false);
    expect(isValidCode('   ')).toBe(false);
  });

  it('should reject very short non-code strings', () => {
    expect(isValidCode('hi')).toBe(false);
    expect(isValidCode('test')).toBe(false);
  });

  it('should accept git diffs as valid', () => {
    const diff = `
diff --git a/file.ts b/file.ts
+  console.log('test');
    `;
    expect(isValidCode(diff)).toBe(true);
  });
});
