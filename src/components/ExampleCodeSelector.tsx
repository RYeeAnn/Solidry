'use client';

import { useState } from 'react';
import { ProgrammingLanguage } from '@/types';

interface ExampleCodeSelectorProps {
  onSelectExample: (code: string, language: ProgrammingLanguage) => void;
  language: ProgrammingLanguage;
}

// Language-specific examples
const EXAMPLES_BY_LANGUAGE: Record<string, Array<{
  id: string;
  title: string;
  description: string;
  code: string;
}>> = {
  typescript: [
    {
      id: 'multiple-issues',
      title: 'Multiple Issues',
      description: 'Good for demo - contains various violations',
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
      code: `class ReportGenerator {
  generateReport(type: string, data: any) {
    if (type === 'pdf') {
      const pdf = new PDFDocument();
      pdf.addPage();
      return pdf;
    } else if (type === 'excel') {
      const excel = new ExcelDocument();
      excel.addSheet();
      return excel;
    } else if (type === 'csv') {
      return data.map(row => row.join(',')).join('\\n');
    }
  }
}`,
    },
    {
      id: 'clean-code',
      title: 'Clean Code',
      description: 'Well-written code - should score high',
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
  ],
  javascript: [
    {
      id: 'multiple-issues',
      title: 'Multiple Issues',
      description: 'Good for demo - contains various violations',
      code: `function getUserData(id, name, email, phone) {
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
      code: `class ReportGenerator {
  generateReport(type, data) {
    if (type === 'pdf') {
      const pdf = new PDFDocument();
      pdf.addPage();
      return pdf;
    } else if (type === 'excel') {
      const excel = new ExcelDocument();
      excel.addSheet();
      return excel;
    } else if (type === 'csv') {
      return data.map(row => row.join(',')).join('\\n');
    }
  }
}`,
    },
    {
      id: 'clean-code',
      title: 'Clean Code',
      description: 'Well-written code - should score high',
      code: `class User {
  constructor(id, email, name) {
    this.id = id;
    this.email = email;
    this.name = name;
  }
}

class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userData) {
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
  ],
  python: [
    {
      id: 'multiple-issues',
      title: 'Multiple Issues',
      description: 'Good for demo - contains various violations',
      code: `def get_user_data(id, name, email, phone):
    print('Fetching user data for:', id)

    data = fetch('https://api.example.com/users/' + str(id))

    if data:
        print('Data found:', data)
        return data
    else:
        return None

class UserService:
    def __init__(self):
        # Direct instantiation - violates DIP
        self.database = PostgresDatabase()
        self.cache = RedisCache()

    # Multiple responsibilities - violates SRP
    def save_user_and_send_email(self, user, email_template):
        self.database.save(user)
        self.send_email(user.email, email_template)
        self.log_activity(user.id, 'user_created')
        self.update_analytics(user)`,
    },
    {
      id: 'solid-violations',
      title: 'SOLID Violations',
      description: 'Focuses on SOLID principle violations',
      code: `class ReportGenerator:
    def generate_report(self, type, data):
        if type == 'pdf':
            # PDF generation logic
            pdf = PDFDocument()
            pdf.add_page()
            return pdf
        elif type == 'excel':
            # Excel generation logic
            excel = ExcelDocument()
            excel.add_sheet()
            return excel
        elif type == 'csv':
            # CSV generation logic
            return '\\n'.join([','.join(row) for row in data])`,
    },
    {
      id: 'clean-code',
      title: 'Clean Code',
      description: 'Well-written code - should score high',
      code: `from abc import ABC, abstractmethod

class UserRepository(ABC):
    @abstractmethod
    def save(self, user):
        pass

    @abstractmethod
    def find_by_id(self, id):
        pass

class User:
    def __init__(self, id, email, name):
        self.id = id
        self.email = email
        self.name = name

class CreateUserUseCase:
    def __init__(self, user_repository):
        self.user_repository = user_repository

    def execute(self, user_data):
        user = User(
            generate_id(),
            user_data['email'],
            user_data['name']
        )

        self.user_repository.save(user)
        return user`,
    },
    {
      id: 'hygiene-issues',
      title: 'Hygiene Issues',
      description: 'Code quality and hygiene problems',
      code: `def x(a, b, c, d, e, f):
    temp = a + b
    data = c + d
    result = e + f

    # TODO: fix this later
    if temp > 10:
        if data > 20:
            if result > 30:
                print('nested')
                return 42  # magic number

    # old_code = 'this is commented out'
    # unused = 'also commented'

    return temp + data + result`,
    },
  ],
  java: [
    {
      id: 'multiple-issues',
      title: 'Multiple Issues',
      description: 'Good for demo - contains various violations',
      code: `public class UserService {
    public Object getUserData(Object id, String name, String email, String phone) {
        System.out.println("Fetching user data for: " + id);

        Object data = fetch("https://api.example.com/users/" + id);

        if (data != null) {
            System.out.println("Data found: " + data);
            return data;
        } else {
            return null;
        }
    }

    private PostgresDatabase database;
    private RedisCache cache;

    public UserService() {
        // Direct instantiation - violates DIP
        this.database = new PostgresDatabase();
        this.cache = new RedisCache();
    }

    // Multiple responsibilities - violates SRP
    public void saveUserAndSendEmail(User user, EmailTemplate emailTemplate) {
        database.save(user);
        sendEmail(user.getEmail(), emailTemplate);
        logActivity(user.getId(), "user_created");
        updateAnalytics(user);
    }
}`,
    },
    {
      id: 'solid-violations',
      title: 'SOLID Violations',
      description: 'Focuses on SOLID principle violations',
      code: `public class ReportGenerator {
    public Object generateReport(String type, Object data) {
        if (type.equals("pdf")) {
            // PDF generation logic
            PDFDocument pdf = new PDFDocument();
            pdf.addPage();
            return pdf;
        } else if (type.equals("excel")) {
            // Excel generation logic
            ExcelDocument excel = new ExcelDocument();
            excel.addSheet();
            return excel;
        } else if (type.equals("csv")) {
            // CSV generation logic
            return String.join("\\n", (List<String>) data);
        }
        return null;
    }
}`,
    },
    {
      id: 'clean-code',
      title: 'Clean Code',
      description: 'Well-written code - should score high',
      code: `public interface UserRepository {
    void save(User user);
    User findById(String id);
}

public class User {
    private final String id;
    private final String email;
    private final String name;

    public User(String id, String email, String name) {
        this.id = id;
        this.email = email;
        this.name = name;
    }
}

public class CreateUserUseCase {
    private final UserRepository userRepository;

    public CreateUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User execute(UserData userData) {
        User user = new User(
            generateId(),
            userData.getEmail(),
            userData.getName()
        );

        userRepository.save(user);
        return user;
    }
}`,
    },
    {
      id: 'hygiene-issues',
      title: 'Hygiene Issues',
      description: 'Code quality and hygiene problems',
      code: `public int x(int a, int b, int c, int d, int e, int f) {
    int temp = a + b;
    int data = c + d;
    int result = e + f;

    // TODO: fix this later
    if (temp > 10) {
        if (data > 20) {
            if (result > 30) {
                System.out.println("nested");
                return 42; // magic number
            }
        }
    }

    // String oldCode = "this is commented out";
    // String unused = "also commented";

    return temp + data + result;
}`,
    },
  ],
  csharp: [
    {
      id: 'multiple-issues',
      title: 'Multiple Issues',
      description: 'Good for demo - contains various violations',
      code: `public class UserService
{
    public object GetUserData(object id, string name, string email, string phone)
    {
        Console.WriteLine("Fetching user data for: " + id);

        var data = Fetch("https://api.example.com/users/" + id);

        if (data != null)
        {
            Console.WriteLine("Data found: " + data);
            return data;
        }
        else
        {
            return null;
        }
    }

    private PostgresDatabase database;
    private RedisCache cache;

    public UserService()
    {
        // Direct instantiation - violates DIP
        this.database = new PostgresDatabase();
        this.cache = new RedisCache();
    }

    // Multiple responsibilities - violates SRP
    public void SaveUserAndSendEmail(User user, EmailTemplate emailTemplate)
    {
        database.Save(user);
        SendEmail(user.Email, emailTemplate);
        LogActivity(user.Id, "user_created");
        UpdateAnalytics(user);
    }
}`,
    },
    {
      id: 'solid-violations',
      title: 'SOLID Violations',
      description: 'Focuses on SOLID principle violations',
      code: `public class ReportGenerator
{
    public object GenerateReport(string type, object data)
    {
        if (type == "pdf")
        {
            var pdf = new PDFDocument();
            pdf.AddPage();
            return pdf;
        }
        else if (type == "excel")
        {
            var excel = new ExcelDocument();
            excel.AddSheet();
            return excel;
        }
        else if (type == "csv")
        {
            return string.Join("\\n", (List<string>)data);
        }
        return null;
    }
}`,
    },
    {
      id: 'clean-code',
      title: 'Clean Code',
      description: 'Well-written code - should score high',
      code: `public interface IUserRepository
{
    void Save(User user);
    User FindById(string id);
}

public class User
{
    public string Id { get; }
    public string Email { get; }
    public string Name { get; }

    public User(string id, string email, string name)
    {
        Id = id;
        Email = email;
        Name = name;
    }
}

public class CreateUserUseCase
{
    private readonly IUserRepository _userRepository;

    public CreateUserUseCase(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public User Execute(UserData userData)
    {
        var user = new User(
            GenerateId(),
            userData.Email,
            userData.Name
        );

        _userRepository.Save(user);
        return user;
    }
}`,
    },
    {
      id: 'hygiene-issues',
      title: 'Hygiene Issues',
      description: 'Code quality and hygiene problems',
      code: `public int X(int a, int b, int c, int d, int e, int f)
{
    var temp = a + b;
    var data = c + d;
    var result = e + f;

    // TODO: fix this later
    if (temp > 10)
    {
        if (data > 20)
        {
            if (result > 30)
            {
                Console.WriteLine("nested");
                return 42; // magic number
            }
        }
    }

    // string oldCode = "this is commented out";
    // string unused = "also commented";

    return temp + data + result;
}`,
    },
  ],
  go: [
    {
      id: 'multiple-issues',
      title: 'Multiple Issues',
      description: 'Good for demo - contains various violations',
      code: `package main

func GetUserData(id interface{}, name, email, phone string) interface{} {
    fmt.Println("Fetching user data for:", id)

    data := fetch("https://api.example.com/users/" + fmt.Sprint(id))

    if data != nil {
        fmt.Println("Data found:", data)
        return data
    } else {
        return nil
    }
}

type UserService struct {
    database *PostgresDatabase
    cache    *RedisCache
}

func NewUserService() *UserService {
    // Direct instantiation - violates DIP
    return &UserService{
        database: NewPostgresDatabase(),
        cache:    NewRedisCache(),
    }
}

// Multiple responsibilities - violates SRP
func (s *UserService) SaveUserAndSendEmail(user User, emailTemplate EmailTemplate) {
    s.database.Save(user)
    s.SendEmail(user.Email, emailTemplate)
    s.LogActivity(user.ID, "user_created")
    s.UpdateAnalytics(user)
}`,
    },
    {
      id: 'solid-violations',
      title: 'SOLID Violations',
      description: 'Focuses on SOLID principle violations',
      code: `type ReportGenerator struct{}

func (r *ReportGenerator) GenerateReport(reportType string, data interface{}) interface{} {
    if reportType == "pdf" {
        pdf := NewPDFDocument()
        pdf.AddPage()
        return pdf
    } else if reportType == "excel" {
        excel := NewExcelDocument()
        excel.AddSheet()
        return excel
    } else if reportType == "csv" {
        return strings.Join(data.([]string), "\\n")
    }
    return nil
}`,
    },
    {
      id: 'clean-code',
      title: 'Clean Code',
      description: 'Well-written code - should score high',
      code: `package main

type UserRepository interface {
    Save(user User) error
    FindByID(id string) (*User, error)
}

type User struct {
    ID    string
    Email string
    Name  string
}

type CreateUserUseCase struct {
    userRepository UserRepository
}

func NewCreateUserUseCase(repo UserRepository) *CreateUserUseCase {
    return &CreateUserUseCase{
        userRepository: repo,
    }
}

func (uc *CreateUserUseCase) Execute(userData UserData) (*User, error) {
    user := &User{
        ID:    GenerateID(),
        Email: userData.Email,
        Name:  userData.Name,
    }

    err := uc.userRepository.Save(*user)
    if err != nil {
        return nil, err
    }

    return user, nil
}`,
    },
    {
      id: 'hygiene-issues',
      title: 'Hygiene Issues',
      description: 'Code quality and hygiene problems',
      code: `func x(a, b, c, d, e, f int) int {
    temp := a + b
    data := c + d
    result := e + f

    // TODO: fix this later
    if temp > 10 {
        if data > 20 {
            if result > 30 {
                fmt.Println("nested")
                return 42 // magic number
            }
        }
    }

    // oldCode := "this is commented out"
    // unused := "also commented"

    return temp + data + result
}`,
    },
  ],
  rust: [
    {
      id: 'multiple-issues',
      title: 'Multiple Issues',
      description: 'Good for demo - contains various violations',
      code: `fn get_user_data(id: &dyn std::any::Any, name: String, email: String, phone: String) -> Option<String> {
    println!("Fetching user data for: {:?}", id);

    let data = fetch(&format!("https://api.example.com/users/{:?}", id));

    if data.is_some() {
        println!("Data found: {:?}", data);
        return data;
    } else {
        return None;
    }
}

struct UserService {
    database: PostgresDatabase,
    cache: RedisCache,
}

impl UserService {
    fn new() -> Self {
        // Direct instantiation - violates DIP
        UserService {
            database: PostgresDatabase::new(),
            cache: RedisCache::new(),
        }
    }

    // Multiple responsibilities - violates SRP
    fn save_user_and_send_email(&self, user: User, email_template: EmailTemplate) {
        self.database.save(user);
        self.send_email(&user.email, email_template);
        self.log_activity(&user.id, "user_created");
        self.update_analytics(user);
    }
}`,
    },
    {
      id: 'solid-violations',
      title: 'SOLID Violations',
      description: 'Focuses on SOLID principle violations',
      code: `struct ReportGenerator;

impl ReportGenerator {
    fn generate_report(&self, report_type: &str, data: Vec<String>) -> Option<String> {
        if report_type == "pdf" {
            let mut pdf = PDFDocument::new();
            pdf.add_page();
            Some(pdf.to_string())
        } else if report_type == "excel" {
            let mut excel = ExcelDocument::new();
            excel.add_sheet();
            Some(excel.to_string())
        } else if report_type == "csv" {
            Some(data.join("\\n"))
        } else {
            None
        }
    }
}`,
    },
    {
      id: 'clean-code',
      title: 'Clean Code',
      description: 'Well-written code - should score high',
      code: `trait UserRepository {
    fn save(&self, user: User) -> Result<(), Error>;
    fn find_by_id(&self, id: &str) -> Result<Option<User>, Error>;
}

struct User {
    id: String,
    email: String,
    name: String,
}

struct CreateUserUseCase<R: UserRepository> {
    user_repository: R,
}

impl<R: UserRepository> CreateUserUseCase<R> {
    fn new(user_repository: R) -> Self {
        CreateUserUseCase { user_repository }
    }

    fn execute(&self, user_data: UserData) -> Result<User, Error> {
        let user = User {
            id: generate_id(),
            email: user_data.email,
            name: user_data.name,
        };

        self.user_repository.save(user.clone())?;
        Ok(user)
    }
}`,
    },
    {
      id: 'hygiene-issues',
      title: 'Hygiene Issues',
      description: 'Code quality and hygiene problems',
      code: `fn x(a: i32, b: i32, c: i32, d: i32, e: i32, f: i32) -> i32 {
    let temp = a + b;
    let data = c + d;
    let result = e + f;

    // TODO: fix this later
    if temp > 10 {
        if data > 20 {
            if result > 30 {
                println!("nested");
                return 42; // magic number
            }
        }
    }

    // let old_code = "this is commented out";
    // let unused = "also commented";

    temp + data + result
}`,
    },
  ],
  cpp: [
    {
      id: 'multiple-issues',
      title: 'Multiple Issues',
      description: 'Good for demo - contains various violations',
      code: `#include <iostream>
#include <string>

void* getUserData(void* id, std::string name, std::string email, std::string phone) {
    std::cout << "Fetching user data for: " << id << std::endl;

    void* data = fetch("https://api.example.com/users/" + std::to_string((long)id));

    if (data != nullptr) {
        std::cout << "Data found: " << data << std::endl;
        return data;
    } else {
        return nullptr;
    }
}

class UserService {
private:
    PostgresDatabase* database;
    RedisCache* cache;

public:
    UserService() {
        // Direct instantiation - violates DIP
        database = new PostgresDatabase();
        cache = new RedisCache();
    }

    // Multiple responsibilities - violates SRP
    void saveUserAndSendEmail(User user, EmailTemplate emailTemplate) {
        database->save(user);
        sendEmail(user.email, emailTemplate);
        logActivity(user.id, "user_created");
        updateAnalytics(user);
    }
};`,
    },
    {
      id: 'solid-violations',
      title: 'SOLID Violations',
      description: 'Focuses on SOLID principle violations',
      code: `class ReportGenerator {
public:
    void* generateReport(std::string type, void* data) {
        if (type == "pdf") {
            PDFDocument* pdf = new PDFDocument();
            pdf->addPage();
            return pdf;
        } else if (type == "excel") {
            ExcelDocument* excel = new ExcelDocument();
            excel->addSheet();
            return excel;
        } else if (type == "csv") {
            return data;
        }
        return nullptr;
    }
};`,
    },
    {
      id: 'clean-code',
      title: 'Clean Code',
      description: 'Well-written code - should score high',
      code: `#include <memory>
#include <string>

class UserRepository {
public:
    virtual void save(const User& user) = 0;
    virtual std::unique_ptr<User> findById(const std::string& id) = 0;
    virtual ~UserRepository() = default;
};

class User {
public:
    User(std::string id, std::string email, std::string name)
        : id_(std::move(id)), email_(std::move(email)), name_(std::move(name)) {}

    const std::string& getId() const { return id_; }
    const std::string& getEmail() const { return email_; }
    const std::string& getName() const { return name_; }

private:
    std::string id_;
    std::string email_;
    std::string name_;
};

class CreateUserUseCase {
public:
    CreateUserUseCase(std::shared_ptr<UserRepository> repo)
        : userRepository_(std::move(repo)) {}

    User execute(const UserData& userData) {
        User user(
            generateId(),
            userData.email,
            userData.name
        );

        userRepository_->save(user);
        return user;
    }

private:
    std::shared_ptr<UserRepository> userRepository_;
};`,
    },
    {
      id: 'hygiene-issues',
      title: 'Hygiene Issues',
      description: 'Code quality and hygiene problems',
      code: `int x(int a, int b, int c, int d, int e, int f) {
    int temp = a + b;
    int data = c + d;
    int result = e + f;

    // TODO: fix this later
    if (temp > 10) {
        if (data > 20) {
            if (result > 30) {
                std::cout << "nested" << std::endl;
                return 42; // magic number
            }
        }
    }

    // std::string oldCode = "this is commented out";
    // std::string unused = "also commented";

    return temp + data + result;
}`,
    },
  ],
};

export default function ExampleCodeSelector({ onSelectExample, language }: ExampleCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectExample = (code: string) => {
    // Use the current language or fallback to typescript
    const exampleLanguage = language === 'auto' ? 'typescript' : language;
    onSelectExample(code, exampleLanguage);
    setIsOpen(false); // Close the dropdown after selection
  };

  // Get examples for the selected language
  const getExamples = () => {
    const targetLanguage = language === 'auto' ? 'typescript' : language;
    return EXAMPLES_BY_LANGUAGE[targetLanguage] || null;
  };

  const examples = getExamples();
  const hasExamples = examples !== null;

  return (
    <div className="panel p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left hover:bg-foreground/5 p-2 -m-2 rounded transition-colors"
      >
        <div>
          <div className="text-sm font-medium">Test with Example Code</div>
          <div className="text-xs text-foreground/60 mt-0.5">
            Optional: Try the analyzer with sample code
          </div>
        </div>
        <svg
          className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {hasExamples ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {examples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => handleSelectExample(example.code)}
                  className="text-left p-3 border border-border rounded hover:bg-foreground/5 transition-colors"
                >
                  <div className="text-sm font-medium">{example.title}</div>
                  <div className="text-xs text-foreground/60 mt-1">{example.description}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-foreground/60">
              <p className="text-sm">No examples available for this language yet.</p>
              <p className="text-xs mt-1">Try selecting TypeScript, JavaScript, Python, Java, C#, Go, Rust, or C++.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
