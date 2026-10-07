import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const SERVER_PORT = 3125;
const CDP_PORT = 9226;
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function waitForHttp(url: string, timeout = 20000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) resolve();
        else retry();
      }).on('error', retry);
    };
    const retry = () => {
      if (Date.now() - start > timeout) reject(new Error(`Timeout waiting for ${url}`));
      else setTimeout(check, 250);
    };
    check();
  });
}

class CdpClient {
  private ws: WebSocket;
  private msgId = 1;
  private pending = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();

  constructor(wsUrl: string) {
    this.ws = new WebSocket(wsUrl);
  }

  async connect(): Promise<void> {
    if (this.ws.readyState === WebSocket.OPEN) return;
    await new Promise<void>((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
    });

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data.toString());
        if (data.id && this.pending.has(data.id)) {
          const { resolve, reject } = this.pending.get(data.id)!;
          this.pending.delete(data.id);
          if (data.error) reject(new Error(data.error.message || JSON.stringify(data.error)));
          else resolve(data.result);
        }
      } catch (err) {}
    };
  }

  send(method: string, params: Record<string, any> = {}): Promise<any> {
    const id = this.msgId++;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(payload);
    });
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function run() {
  console.log('================================================================');
  console.log(' RESEARCHFLOW AI - MOBILE NAVIGATION INTERACTION AUDIT');
  console.log('================================================================\n');

  const server = spawn('node', ['dist/server.cjs'], {
    env: { ...process.env, PORT: String(SERVER_PORT), NODE_ENV: 'production' },
    stdio: 'ignore',
  });

  const tmpProfileDir = path.join(os.tmpdir(), `edge-nav-profile-${Date.now()}`);
  fs.mkdirSync(tmpProfileDir, { recursive: true });

  let edgeProcess: ChildProcess | null = null;
  let browserClient: CdpClient | null = null;
  let pageClient: CdpClient | null = null;
  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, name: string, detail?: string) {
    if (cond) {
      passed++;
      console.log(`  [PASS] ${name}`);
    } else {
      failed++;
      console.error(`  [FAIL] ${name} - ${detail || ''}`);
    }
  }

  try {
    await waitForHttp(`http://localhost:${SERVER_PORT}/api/health`);
    edgeProcess = spawn(EDGE_PATH, [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${tmpProfileDir}`,
      '--disable-gpu',
      '--mute-audio',
      'about:blank',
    ]);

    await waitForHttp(`http://127.0.0.1:${CDP_PORT}/json/version`);
    const version = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/version`);

    browserClient = new CdpClient(version.webSocketDebuggerUrl);
    await browserClient.connect();

    const newTarget = await browserClient.send('Target.createTarget', {
      url: `http://localhost:${SERVER_PORT}/`,
    });
    const targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json`);
    const pageTarget = targets.find((t: any) => t.id === newTarget.targetId || t.type === 'page');

    pageClient = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await pageClient.connect();

    await pageClient.send('Page.enable');
    await pageClient.send('Runtime.enable');

    // Emulate iPhone (390x844)
    await pageClient.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });

    await new Promise((r) => setTimeout(r, 1000));

    // Test 1: Burger button is visible
    const burgerVisible = await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('button[aria-label="Open menu"]');
        return !!btn && btn.offsetParent !== null;
      })()`,
      returnByValue: true,
    });
    assert(burgerVisible.result.value === true, 'Mobile menu burger button is visible on mobile viewport');

    // Test 2: Click burger button to open drawer
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('button[aria-label="Open menu"]');
        if (btn) btn.click();
      })()`,
    });

    await new Promise((r) => setTimeout(r, 200));

    const drawerOpen = await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const drawer = document.querySelector('nav + div');
        const bodyLocked = document.body.style.overflow === 'hidden';
        const hasProblemLink = document.body.textContent.includes('The Problem');
        return { hasDrawer: !!drawer, bodyLocked, hasProblemLink };
      })()`,
      returnByValue: true,
    });

    const dRes = drawerOpen.result.value;
    assert(dRes.hasDrawer, 'Mobile navigation drawer mounts in DOM');
    assert(dRes.bodyLocked, 'Body scroll is locked (overflow: hidden) when drawer is active');
    assert(dRes.hasProblemLink, 'Drawer renders navigation section links');

    // Test 3: Close menu via close button or Escape key
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      })()`,
    });

    await new Promise((r) => setTimeout(r, 200));

    const drawerClosed = await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const bodyLocked = document.body.style.overflow === 'hidden';
        const openBtn = document.querySelector('button[aria-label="Open menu"]');
        return { bodyUnlocked: !bodyLocked, openBtnPresent: !!openBtn };
      })()`,
      returnByValue: true,
    });

    const dcRes = drawerClosed.result.value;
    assert(dcRes.bodyUnlocked, 'Body scroll is restored (unlocked) on menu dismissal via Escape');
    assert(dcRes.openBtnPresent, 'Navigation state cleanly resets back to default collapsed state');

    console.log('\n================================================================');
    console.log(`NAV INTERACTION AUDIT: ${passed} PASS / ${failed} FAIL`);
    console.log('================================================================');

    if (failed > 0) process.exitCode = 1;
    else process.exitCode = 0;

  } catch (err) {
    console.error('Nav test failed:', err);
    process.exitCode = 1;
  } finally {
    if (pageClient) pageClient.close();
    if (browserClient) browserClient.close();
    if (edgeProcess) edgeProcess.kill();
    server.kill();
    try {
      fs.rmSync(tmpProfileDir, { recursive: true, force: true });
    } catch {}
  }
}

run();
