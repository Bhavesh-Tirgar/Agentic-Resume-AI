/**
 * End-to-End Headless Browser Smoke & Interactive Verification Suite.
 * Uses Playwright when installed (e.g. GitHub Actions CI) or falls back
 * cleanly to native Node WebSocket Chrome DevTools Protocol against Chrome/Edge.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE_URL = (process.env.E2E_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const ROUTES_TO_VERIFY = [
  { path: "/studio", expectText: "ATS", clickTab: null },
  { path: "/matcher", expectText: "Job Match", clickTab: null },
  { path: "/scout", expectText: "Opportunities", clickTab: "Ranked Gaps" },
  { path: "/interview", expectText: "Marcus Vance", clickTab: "Past Sessions & History" },
];

function findBrowserExecutable() {
  const candidates = [
    process.env.CHROME_BIN,
    "C:\\Users\\DELL\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p)) || null;
}

async function runWithPlaywright() {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on("pageerror", (err) => errors.push(`PageError: ${err.message}`));
  page.on("response", (res) => {
    if (res.url().startsWith(BASE_URL) && res.status() >= 500) {
      errors.push(`HTTP ${res.status()} on ${res.url()}`);
    }
  });

  try {
    for (const route of ROUTES_TO_VERIFY) {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForFunction(
        (expected) => document.body && document.body.innerText.includes(expected),
        route.expectText,
        { timeout: 15000 }
      );
      if (route.clickTab) {
        const btn = page.locator("button", { hasText: route.clickTab }).first();
        if (await btn.count()) {
          await btn.click();
          await page.waitForTimeout(400);
        }
      }
      console.log(`[PASS][Playwright] ${route.path} hydrated & rendered "${route.expectText}"`);
    }
  } finally {
    await browser.close();
  }

  if (errors.length > 0) {
    throw new Error(`Browser E2E failures:\n${errors.join("\n")}`);
  }
}

async function runWithNativeCdp(browserPath) {
  const port = 9229;
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "careerpilot-e2e-"));
  const proc = spawn(
    browserPath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let ws = null;
  try {
    let target = null;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/list`);
        const pages = await res.json();
        target = pages.find((p) => p.type === "page") || pages[0];
        if (target?.webSocketDebuggerUrl) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 250));
    }
    if (!target?.webSocketDebuggerUrl) {
      throw new Error("Could not connect to headless browser DevTools endpoint.");
    }

    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pending = new Map();
    const errors = [];

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data.toString());
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method === "Runtime.exceptionThrown") {
        const txt = msg.params?.exceptionDetails?.exception?.description || msg.params?.exceptionDetails?.text || "Unknown JS error";
        errors.push(`RuntimeException: ${txt}`);
      } else if (msg.method === "Network.responseReceived") {
        const r = msg.params?.response;
        if (r && r.url?.startsWith(BASE_URL) && r.status >= 500) {
          errors.push(`HTTP ${r.status} on ${r.url}`);
        }
      }
    };

    const sendCdp = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });

    await sendCdp("Page.enable");
    await sendCdp("Runtime.enable");
    await sendCdp("Network.enable");

    for (const route of ROUTES_TO_VERIFY) {
      await sendCdp("Page.navigate", { url: `${BASE_URL}${route.path}` });

      let hydrated = false;
      for (let attempt = 0; attempt < 40; attempt++) {
        await new Promise((r) => setTimeout(r, 300));
        const evalRes = await sendCdp("Runtime.evaluate", {
          expression: `document.readyState === "complete" && (document.body?.innerText || "").includes(${JSON.stringify(route.expectText)})`,
          returnByValue: true,
        });
        if (evalRes?.result?.value === true) {
          hydrated = true;
          break;
        }
      }
      if (!hydrated) {
        throw new Error(`Timed out waiting for ${route.path} to render "${route.expectText}"`);
      }

      if (route.clickTab) {
        await sendCdp("Runtime.evaluate", {
          expression: `(() => {
            const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes(${JSON.stringify(route.clickTab)}));
            if (btn) { btn.click(); return true; }
            return false;
          })()`,
          returnByValue: true,
        });
        await new Promise((r) => setTimeout(r, 350));
      }

      console.log(`[PASS][Chrome-CDP] ${route.path} hydrated & rendered "${route.expectText}"`);
    }

    if (errors.length > 0) {
      throw new Error(`Browser E2E failures:\n${errors.join("\n")}`);
    }
  } finally {
    try {
      ws?.close();
    } catch {}
    try {
      proc.kill("SIGKILL");
    } catch {}
    try {
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch {}
  }
}

async function main() {
  try {
    await import("playwright");
    await runWithPlaywright();
    console.log("All Playwright E2E checks passed!");
    return;
  } catch (err) {
    if (!String(err?.code || err?.message).includes("ERR_MODULE_NOT_FOUND") && !String(err?.message).includes("Cannot find package")) {
      throw err;
    }
  }

  const browserPath = findBrowserExecutable();
  if (!browserPath) {
    throw new Error("Neither 'playwright' npm package nor Chromium/Chrome/Edge binary found.");
  }
  await runWithNativeCdp(browserPath);
  console.log("All Chrome CDP E2E checks passed!");
}

main().catch((err) => {
  console.error("E2E FAILED:", err);
  process.exit(1);
});
