import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const VIEWPORTS = [
  { name: 'Desktop Ultrawide', width: 2560, height: 1440 },
  { name: 'Desktop Full HD (1920x1080)', width: 1920, height: 1080 },
  { name: 'Desktop Laptop (1440x900)', width: 1440, height: 900 },
  { name: 'Tablet Large / iPad Pro (1024x1366)', width: 1024, height: 1366 },
  { name: 'Tablet Small / iPad Mini (768x1024)', width: 768, height: 1024 },
  { name: 'Mobile Pro Max (430x932)', width: 430, height: 932 },
  { name: 'Mobile Standard iPhone (390x844)', width: 390, height: 844 },
  { name: 'Mobile Android (360x800)', width: 360, height: 800 },
  { name: 'Mobile Small / iPhone SE (320x568)', width: 320, height: 568 },
];

const SERVER_PORT = 3123;
const CDP_PORT = 9224;
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
      } catch (err) {
        // ignore parse error
      }
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
  console.log(' RESEARCHFLOW AI - AUTOMATED HEADLESS CDP VIEWPORT AUDIT');
  console.log('================================================================\n');

  // 1. Start App Server
  console.log(`Starting ResearchFlow application server on port ${SERVER_PORT}...`);
  const server = spawn('node', ['dist/server.cjs'], {
    env: { ...process.env, PORT: String(SERVER_PORT), NODE_ENV: 'production' },
    stdio: 'ignore',
  });

  const tmpProfileDir = path.join(os.tmpdir(), `edge-cdp-profile-${Date.now()}`);
  fs.mkdirSync(tmpProfileDir, { recursive: true });

  let edgeProcess: ChildProcess | null = null;
  let browserClient: CdpClient | null = null;
  let pageClient: CdpClient | null = null;
  let totalPass = 0;
  let totalFail = 0;

  try {
    await waitForHttp(`http://localhost:${SERVER_PORT}/api/health`);
    console.log(`App server is ready and serving.\n`);

    // 2. Launch Headless Edge
    console.log(`Launching Headless Edge via CDP on port ${CDP_PORT}...`);
    edgeProcess = spawn(EDGE_PATH, [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${tmpProfileDir}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--mute-audio',
      'about:blank',
    ]);

    await waitForHttp(`http://127.0.0.1:${CDP_PORT}/json/version`);
    const version = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/version`);
    console.log(`Edge CDP initialized: ${version['Browser']}\n`);

    browserClient = new CdpClient(version.webSocketDebuggerUrl);
    await browserClient.connect();

    // Create target page
    const newTarget = await browserClient.send('Target.createTarget', {
      url: `http://localhost:${SERVER_PORT}/`,
    });
    const targetId = newTarget.targetId;

    // Attach to page
    const targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json`);
    const pageTarget = targets.find((t: any) => t.id === targetId || t.type === 'page');
    if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
      throw new Error('Could not find created page target in CDP list');
    }

    pageClient = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await pageClient.connect();

    // Enable Page and Runtime
    await pageClient.send('Page.enable');
    await pageClient.send('Runtime.enable');
    await pageClient.send('DOM.enable');

    // Wait for initial load
    await new Promise((r) => setTimeout(r, 1500));

    // Audit each viewport
    for (const vp of VIEWPORTS) {
      console.log(`--- Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);

      // Override viewport
      await pageClient.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768,
      });

      // Let DOM reflow
      await new Promise((r) => setTimeout(r, 400));

      // 1. Measure horizontal overflow
      const overflowEval = await pageClient.send('Runtime.evaluate', {
        expression: `(() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          const hasOverflow = docWidth > winWidth;
          const culprits = [];

          if (hasOverflow) {
            const all = Array.from(document.querySelectorAll('*'));
            for (const el of all) {
              const r = el.getBoundingClientRect();
              if (r.right > winWidth + 1) {
                culprits.push({
                  tag: el.tagName.toLowerCase(),
                  class: (el.className || '').toString().slice(0, 70),
                  width: Math.round(r.width),
                  right: Math.round(r.right),
                  excess: Math.round(r.right - winWidth)
                });
              }
            }
          }

          return JSON.stringify({
            docWidth,
            winWidth,
            hasOverflow,
            culprits: culprits.slice(0, 5)
          });
        })()`,
        returnByValue: true,
      });

      const res = JSON.parse(overflowEval.result.value);

      if (!res.hasOverflow) {
        totalPass++;
        console.log(`  [PASS] Zero horizontal overflow: scrollWidth=${res.docWidth}px <= innerWidth=${res.winWidth}px`);
      } else {
        totalFail++;
        console.error(`  [FAIL] Overflow detected: scrollWidth=${res.docWidth}px > innerWidth=${res.winWidth}px`);
        console.error(`         Offending elements:`, res.culprits);
      }

      // 2. Measure Canvas Presence & Styling
      const canvasEval = await pageClient.send('Runtime.evaluate', {
        expression: `(() => {
          const c = document.querySelector('canvas');
          if (!c) return JSON.stringify({ exists: false });
          const parent = c.parentElement;
          const parentStyle = parent ? window.getComputedStyle(parent) : null;
          const style = window.getComputedStyle(c);
          const isFixed = (parentStyle && parentStyle.position === 'fixed') || style.position === 'fixed';
          return JSON.stringify({
            exists: true,
            w: c.width,
            h: c.height,
            position: style.position,
            parentPosition: parentStyle ? parentStyle.position : null,
            isFixed,
            zIndex: parentStyle ? parentStyle.zIndex : style.zIndex
          });
        })()`,
        returnByValue: true,
      });

      const cRes = JSON.parse(canvasEval.result.value);
      if (cRes.exists && cRes.isFixed && cRes.w > 0 && cRes.h > 0) {
        totalPass++;
        console.log(`  [PASS] Persistent Canvas: fixed background buffer (${cRes.w}x${cRes.h}, parent=${cRes.parentPosition})`);
      } else {
        totalFail++;
        console.error(`  [FAIL] Canvas issue:`, cRes);
      }

      // 3. Scroll Simulation
      const scrollEval = await pageClient.send('Runtime.evaluate', {
        expression: `(async () => {
          const steps = [0.0, 0.25, 0.5, 0.75, 1.0];
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          let errors = 0;
          for (const s of steps) {
            window.scrollTo(0, maxScroll * s);
            await new Promise(r => setTimeout(r, 40));
          }
          return JSON.stringify({ maxScroll, steps: steps.length, errors });
        })()`,
        awaitPromise: true,
        returnByValue: true,
      });

      const sRes = JSON.parse(scrollEval.result.value);
      if (sRes.steps === 5 && sRes.errors === 0) {
        totalPass++;
        console.log(`  [PASS] Full continuous page scroll smooth (scrollHeight: ${sRes.maxScroll}px)`);
      } else {
        totalFail++;
        console.error(`  [FAIL] Scroll test failed:`, sRes);
      }

      console.log('');
    }

    console.log('================================================================');
    console.log(`TOTAL AUDIT CHECKS: ${totalPass} PASS / ${totalFail} FAIL`);
    console.log('================================================================');

    if (totalFail > 0) process.exitCode = 1;
    else process.exitCode = 0;

  } catch (err) {
    console.error('Audit failed with error:', err);
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
