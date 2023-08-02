import { assert } from "./test_deps.ts";
import { withPage } from "./utils.ts";

Deno.test({
  name: "CRUD operations for users",
  async fn(t) {
    await withPage(async (page, address) => {
      await t.step("Go to the models page", async () => {
        await page.goto(`${address}/models`, { waitUntil: "load" });
        assert(
          page.url() === `${address}/models`,
          `Actual ${page.url()} is unexpected`,
        );
      });

      await t.step("Click on the 'users' link", async () => {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "load", timeout: 5000 }),
          page.click('a[href="/users"]'),
        ]);
        assert(
          page.url() === `${address}/users`,
          `Actual ${page.url()} is unexpected`,
        );
      });

      await t.step("Create a new user", async () => {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "load", timeout: 5000 }),
          page.click('a[href="/users/new"]'),
        ]);
        assert(
          page.url() === `${address}/users/new`,
          `Actual ${page.url()} is unexpected`,
        );

        await Promise.all([
          page.waitForNavigation({ waitUntil: "load", timeout: 5000 }),
          page.click('button[type="submit"]'),
        ]);
        assert(
          page.url().startsWith(`${address}/users/`),
          `Actual ${page.url()} is unexpected`,
        );
      });

      await t.step("Verify the user was created", async () => {
        const userExists = await page.$eval(
          ".border",
          (el) => el.textContent.includes("id"),
        );
        assert(userExists, "User was not created");
      });

      await t.step("Create another user", async () => {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "load", timeout: 5000 }),
          page.click('a[href="/users"]'),
        ]);
        assert(
          page.url() === `${address}/users`,
          `Actual ${page.url()} is unexpected`,
        );

        await Promise.all([
          page.waitForNavigation({ waitUntil: "load", timeout: 5000 }),
          page.click('a[href="/users/new"]'),
        ]);
        assert(
          page.url() === `${address}/users/new`,
          `Actual ${page.url()} is unexpected`,
        );

        await Promise.all([
          page.waitForNavigation({ waitUntil: "load", timeout: 5000 }),
          page.click('button[type="submit"]'),
        ]);
        assert(
          page.url().startsWith(`${address}/users/`),
          `Actual ${page.url()} is unexpected`,
        );
      });

      await t.step("Delete all users", async () => {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "load", timeout: 5000 }),
          page.click('a[href="/users"]'),
        ]);
        assert(
          page.url() === `${address}/users`,
          `Actual ${page.url()} is unexpected`,
        );
        // console.log(await page.content());

        await Promise.all([
          page.waitForNavigation({ waitUntil: "load", timeout: 5000 }),
          page.click("#delete-all-button"),
        ]);
        assert(
          page.url() === `${address}/users`,
          `Actual ${page.url()} is unexpected`,
        );
      });

      await t.step("Create another user for single delete", async () => {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "load", timeout: 5000 }),
          page.click('a[href="/users/new"]'),
        ]);
        assert(
          page.url() === `${address}/users/new`,
          `Actual ${page.url()} is unexpected`,
        );

        await Promise.all([
          page.waitForNavigation({ waitUntil: "load", timeout: 5000 }),
          page.click('button[type="submit"]'),
        ]);
        assert(
          page.url().startsWith(`${address}/users/`),
          `Actual ${page.url()} is unexpected`,
        );
      });

      await t.step("Delete the user", async () => {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "load", timeout: 5000 }),
          page.click("#delete-single-button"),
        ]);
        assert(
          page.url() === `${address}/users`,
          `Actual ${page.url()} is unexpected`,
        );
      });

      await t.step("Verify there are no users", async () => {
        const deleteButtons = await page.$$("#delete-single-button");
        assert(deleteButtons.length === 0, "Users were not deleted");
      });
    });
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
