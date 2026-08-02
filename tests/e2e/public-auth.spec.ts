import { expect, test } from "@playwright/test";
test("landing and email-link sign-in are responsive and keyboard-accessible", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Medical data in. Trustworthy CSV out.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Demonstration only.", { exact: false }).first(),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  await page.screenshot({
    path: `work/qa/landing-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Email me a sign-in link instead" })
    .click();
  await expect(
    page.getByRole("button", { name: "Send secure sign-in link" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeEditable();
  await page.screenshot({
    path: `work/qa/login-email-link-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.goto("/signup");
  await expect(
    page.getByRole("heading", { name: "Create your secure workspace" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeEditable();
});
