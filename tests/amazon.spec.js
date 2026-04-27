const { test, expect } = require("@playwright/test");

async function dismissAmazonPopups(page) {
  const popupButtons = [
    "input[data-action-type='DISMISS']",
    "button:has-text('Dismiss')",
    "input[aria-labelledby='GLUXConfirmClose-announce']",
    "#sp-cc-accept",
  ];

  for (const selector of popupButtons) {
    const button = page.locator(selector).first();
    if (await button.isVisible({ timeout: 1500 }).catch(() => false)) {
      await button.click();
    }
  }
}

const priceSelectors = [
  ".a-price .a-offscreen",
  "#priceblock_ourprice",
  "#priceblock_dealprice",
  ".priceToPay .a-offscreen",
  "#corePrice_feature_div .a-offscreen",
];

const addToCartSelectors = [
  "#add-to-cart-button",
  'input[name="submit.add-to-cart"]',
  'input[name="submit.addToCart"]',
  'button[name="submit.addToCart"]',
  'button:has-text("Add to cart")',
  'span.a-button:has-text("Add to cart")',
  'span.a-button-primary:has-text("Add to cart")',
  'input.a-button-input[aria-label*="Add to cart"]',
  'input.a-button-input[aria-label*="Add to Cart"]',
  'input.a-button-input[aria-labelledby*="submit.add-to-cart"]',
  '[aria-label*="Add to cart"]',
  '[aria-label*="Add to Cart"]',
];

async function getFirstPricedSearchResult(page) {
  const resultCards = page
    .locator(
      '[data-component-type="s-search-result"], div[data-asin]:not([data-asin=""])'
    )
    .filter({
      has: page.locator('a[href*="/dp/"], a[href*="/gp/product/"]'),
    });

  await resultCards.first().waitFor({ state: "visible", timeout: 20_000 });

  const resultCount = await resultCards.count();
  const maxResultsToTry = Math.min(resultCount, 8);
  let firstPricedResult = null;
  for (let i = 0; i < maxResultsToTry; i++) {
    const result = resultCards.nth(i);
    await result.scrollIntoViewIfNeeded().catch(() => {});
    const price = await extractPriceFrom(result);
    if (price === "Price not found") {
      continue;
    }
    firstPricedResult ||= result;
    if (await hasAddToCart(result)) {
      return result;
    }
  }

  if (firstPricedResult) {
    return firstPricedResult;
  }

  return resultCards.first();
}

async function extractPriceFrom(scope) {
  for (const selector of priceSelectors) {
    const el = scope.locator(selector).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      return ((await el.textContent()) || "Price not found").trim();
    }
  }

  const visiblePrice = scope
    .getByText(/(?:\$|INR|USD|Rs\.?|GBP|EUR)\s*[\d,]+(?:\.\d+)?/i)
    .first();
  if (await visiblePrice.isVisible({ timeout: 1000 }).catch(() => false)) {
    return ((await visiblePrice.textContent()) || "Price not found")
      .replace(/\s+/g, " ")
      .trim();
  }

  return "Price not found";
}

async function clickAddToCart(scope) {
  const buttonByRole = scope.getByRole("button", { name: /add to cart/i }).first();
  if (
    (await buttonByRole.isVisible({ timeout: 2000 }).catch(() => false)) &&
    (await buttonByRole.isEnabled({ timeout: 500 }).catch(() => false))
  ) {
    await buttonByRole.click({ timeout: 5000 });
    return true;
  }

  for (const selector of addToCartSelectors) {
    const button = scope.locator(selector).first();
    if (
      (await button.isVisible({ timeout: 2000 }).catch(() => false)) &&
      (await button.isEnabled({ timeout: 500 }).catch(() => false))
    ) {
      await button.click({ timeout: 5000 });
      return true;
    }
  }

  return false;
}

async function hasAddToCart(scope) {
  const buttonByRole = scope.getByRole("button", { name: /add to cart/i }).first();
  if (
    (await buttonByRole.isVisible({ timeout: 500 }).catch(() => false)) &&
    (await buttonByRole.isEnabled({ timeout: 500 }).catch(() => false))
  ) {
    return true;
  }

  for (const selector of addToCartSelectors) {
    const button = scope.locator(selector).first();
    if (
      (await button.isVisible({ timeout: 500 }).catch(() => false)) &&
      (await button.isEnabled({ timeout: 500 }).catch(() => false))
    ) {
      return true;
    }
  }

  return false;
}

async function openSearchResult(resultCard) {
  const productLink = resultCard
    .first()
    .locator(
      [
        "h2 a",
        "a.a-link-normal.a-text-normal",
        'a[href*="/dp/"]',
        'a[href*="/gp/product/"]',
      ].join(", ")
    )
    .first();

  await productLink.waitFor({ state: "visible", timeout: 10_000 });
  await productLink.click();
}

function expectValidPrice(price) {
  expect(price).not.toBe("Price not found");
  expect(price).toMatch(/(\$|INR|USD|Rs\.?|GBP|EUR)\s*\d/i);
}

async function searchAndAddToCart(page, searchQuery) {
  await page.goto("https://www.amazon.com", {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });

  await dismissAmazonPopups(page);

  const searchBox = page.locator("#twotabsearchtextbox");
  await searchBox.fill(searchQuery);
  await searchBox.press("Enter");
  await page.waitForLoadState("domcontentloaded");
  await dismissAmazonPopups(page);

  const firstResult = await getFirstPricedSearchResult(page);
  let price = await extractPriceFrom(firstResult);

  if (await clickAddToCart(firstResult)) {
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    return price;
  }

  await openSearchResult(firstResult);
  await page.waitForLoadState("domcontentloaded");

  const productPagePrice = await extractPriceFrom(page);
  if (productPagePrice !== "Price not found") {
    price = productPagePrice;
  }

  if (await clickAddToCart(page)) {
    await page.waitForLoadState("domcontentloaded");

    const noThanks = page.locator(
      "button:has-text('No thanks'), [data-action='a-expander-collapse']"
    );
    if (await noThanks.isVisible({ timeout: 3000 }).catch(() => false)) {
      await noThanks.click();
    }
  } else {
    console.warn(
      `  [WARN] 'Add to Cart' button not found for "${searchQuery}" - item may require size/color selection.`
    );
  }

  return price;
}

test.describe.configure({ mode: "parallel" });

test("TC1 - Search iPhone, add to cart, print price", async ({ page }) => {
  console.log("\n[TC1] Starting: iPhone search on Amazon...");

  const price = await searchAndAddToCart(page, "iPhone");

  console.log(`\n[TC1] iPhone Price: ${price}`);
  expectValidPrice(price);
});

test("TC2 - Search Samsung Galaxy, add to cart, print price", async ({
  page,
}) => {
  console.log("\n[TC2] Starting: Samsung Galaxy search on Amazon...");

  const price = await searchAndAddToCart(page, "Samsung Galaxy phone");

  console.log(`\n[TC2] Samsung Galaxy Price: ${price}`);
  expectValidPrice(price);
});
