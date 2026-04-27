# Amazon Automation Tests — TestMu AI Assignment

Automated test cases for Amazon.com using **Playwright** (JavaScript/Node.js).

**Author:** Saurabh Pramanik  
**Assignment:** Customer Engineering Intern — TestMu AI

---

## Test Cases

| # | Scenario | Output |
|---|----------|--------|
| TC1 | Search for **iPhone** on Amazon → add first result to cart | Prints price to console |
| TC2 | Search for **Samsung Galaxy** on Amazon → add first result to cart | Prints price to console |

Both tests run **in parallel** (2 workers) via Playwright's built-in parallel execution.

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v8 or higher

---
---

## 🚀 Tech Stack

- **Framework:** Playwright  
- **Language:** JavaScript  
- **Test Runner:** Playwright Test  
- **Execution Mode:** Parallel (using Playwright workers)

---

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/lambdatest-amazon-automation.git
cd lambdatest-amazon-automation

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium
```

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

## Running the Tests

### Local Execution (Headless)
```bash
npm test
```

### Local Execution (Headed — see the browser)
```bash
npm run test:headed
```

### View HTML Report (after a test run)
```bash
npm run report
```

---

## Bonus: Run on LambdaTest Cloud 

Sign up at [LambdaTest.com](https://www.lambdatest.com) and grab your credentials from the dashboard.

```bash
# Set your credentials
export LT_USERNAME="your_lambdatest_username"
export LT_ACCESS_KEY="your_lambdatest_access_key"

# Run on LambdaTest Cloud
npm run test:lambdatest
```

The tests will execute on LambdaTest's cloud infrastructure with video recording, network logs, and console logs captured automatically.

---

## Project Structure

```
lambdatest-amazon-automation/
├── tests/
│   └── amazon.spec.js       # TC1 and TC2 test cases
├── playwright.config.js     # Parallel config + LambdaTest setup
├── package.json
└── README.md
```

---

## Key Technical Decisions

- **Playwright** chosen for its modern async API, auto-wait, and first-class parallel execution support.
- **`workers: 2` + `fullyParallel: true`** in `playwright.config.js` ensures TC1 and TC2 run simultaneously.
- Multiple CSS selectors are tried for price extraction to handle Amazon's A/B UI variations.
- `retries: 1` handles transient network flakiness.
