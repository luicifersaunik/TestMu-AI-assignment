# TestMu AI Automation Assignment

This repository contains automated test cases developed as part of the Customer Engineering Intern assignment for TestMu AI (formerly LambdaTest).

The objective of this assignment is to automate real-world e-commerce workflows and demonstrate parallel test execution.

---

## 🚀 Tech Stack

- **Framework:** Playwright  
- **Language:** JavaScript  
- **Test Runner:** Playwright Test  
- **Execution Mode:** Parallel (using Playwright workers)

---

## 📌 Test Scenarios

### ✅ Test Case 1: iPhone Purchase Flow
- Navigate to Amazon  
- Search for "iPhone"  
- Select a product from search results  
- Add the product to the cart  
- Extract and print the product price in the console  

---

### ✅ Test Case 2: Galaxy Device Purchase Flow
- Navigate to Amazon  
- Search for "Galaxy"  
- Select a product from search results  
- Add the product to the cart  
- Extract and print the product price in the console  

---

## ⚡ Parallel Execution

Both test cases are configured to run in parallel using Playwright’s built-in parallel execution feature.

This is achieved by configuring multiple workers in the Playwright test runner.

Example:
```bash
npx playwright test --workers=2
