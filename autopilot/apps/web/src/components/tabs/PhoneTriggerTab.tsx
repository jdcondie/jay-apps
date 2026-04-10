import { useState } from 'react';
import { Mono } from '../ui/Mono';
import { Tag } from '../ui/Tag';
import { CodeBlock } from '../ui/CodeBlock';
import styles from './PhoneTriggerTab.module.css';

const WEBHOOK_SERVER = `#!/usr/bin/env python3
# webhook_server.py — receives calls from Telegram bot
import os
import json
import asyncio
from aiohttp import web
from datetime import datetime

WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', 'changeme')
OPENCLAW_PORT  = int(os.getenv('OPENCLAW_PORT', 8765))

async def handle_trigger(request):
    if request.headers.get('X-Secret') != WEBHOOK_SECRET:
        return web.Response(status=401, text='Unauthorized')
    body = await request.json()
    print(f"[{datetime.now().isoformat()}] Trigger received: {body}")
    # Forward to OpenClaw
    reader, writer = await asyncio.open_connection('127.0.0.1', OPENCLAW_PORT)
    writer.write(json.dumps(body).encode())
    await writer.drain()
    writer.close()
    return web.Response(text='OK')

app = web.Application()
app.router.add_post('/trigger', handle_trigger)

if __name__ == '__main__':
    web.run_app(app, port=int(os.getenv('PORT', 9000)))
`;

const TELEGRAM_BOT = `#!/usr/bin/env python3
# telegram_bot.py — sends voice transcription to webhook
import os
import httpx
import asyncio
from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, filters, ContextTypes

WEBHOOK_URL    = os.getenv('WEBHOOK_URL', 'http://localhost:9000/trigger')
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', 'changeme')
BOT_TOKEN      = os.getenv('TELEGRAM_BOT_TOKEN')
ALLOWED_USER   = int(os.getenv('ALLOWED_TELEGRAM_USER_ID', '0'))

async def handle_voice(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ALLOWED_USER:
        return
    file = await update.message.voice.get_file()
    path = await file.download_to_drive()
    # Transcribe with Whisper or similar
    transcript = transcribe(str(path))
    async with httpx.AsyncClient() as client:
        await client.post(
            WEBHOOK_URL,
            json={'task': transcript, 'source': 'phone'},
            headers={'X-Secret': WEBHOOK_SECRET}
        )
    await update.message.reply_text(f'Queued: {transcript[:80]}...')

def transcribe(path: str) -> str:
    # Replace with actual Whisper call
    import openai
    client = openai.OpenAI()
    with open(path, 'rb') as f:
        return client.audio.transcriptions.create(model='whisper-1', file=f).text

app = ApplicationBuilder().token(BOT_TOKEN).build()
app.add_handler(MessageHandler(filters.VOICE, handle_voice))
app.run_polling()
`;

const DESKTOP_WATCHER = `#!/usr/bin/env python3
# desktop_watcher.py — watches a folder for new task files
import os
import time
import json
import httpx
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

WATCH_DIR      = os.path.expanduser('~/Desktop/autopilot-tasks')
WEBHOOK_URL    = os.getenv('WEBHOOK_URL', 'http://localhost:9000/trigger')
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', 'changeme')

os.makedirs(WATCH_DIR, exist_ok=True)

class TaskHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory or not event.src_path.endswith('.txt'):
            return
        time.sleep(0.2)  # ensure file is fully written
        with open(event.src_path, 'r') as f:
            task = f.read().strip()
        if task:
            httpx.post(
                WEBHOOK_URL,
                json={'task': task, 'source': 'desktop'},
                headers={'X-Secret': WEBHOOK_SECRET}
            )
            print(f"Sent: {task[:60]}...")
        os.remove(event.src_path)

observer = Observer()
observer.schedule(TaskHandler(), WATCH_DIR, recursive=False)
observer.start()
print(f"Watching: {WATCH_DIR}")
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    observer.stop()
observer.join()
`;

type ScriptId = 'webhook' | 'telegram' | 'desktop';

export function PhoneTriggerTab() {
  const [active, setActive] = useState<ScriptId>('webhook');

  const scripts: Record<ScriptId, { label: string; code: string; desc: string }> = {
    webhook:  { label: 'Webhook Server',   code: WEBHOOK_SERVER,   desc: 'Receives triggers from Telegram bot and forwards to OpenClaw.' },
    telegram: { label: 'Telegram Bot',     code: TELEGRAM_BOT,     desc: 'Accepts voice messages, transcribes, and fires the webhook.' },
    desktop:  { label: 'Desktop Watcher',  code: DESKTOP_WATCHER,  desc: 'Watches ~/Desktop/autopilot-tasks for .txt files, sends to webhook.' },
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Phone Trigger</h2>
        <Mono dim size="xs">Voice-activate AutoPilot from your phone via Telegram.</Mono>
      </div>

      <div className={styles.flow}>
        <div className={styles.flowStep}>
          <Tag color="blue">Phone</Tag>
          <Mono dim size="xs">Voice message → Telegram</Mono>
        </div>
        <span className={styles.arrow}>→</span>
        <div className={styles.flowStep}>
          <Tag color="orange">Bot</Tag>
          <Mono dim size="xs">Whisper transcription</Mono>
        </div>
        <span className={styles.arrow}>→</span>
        <div className={styles.flowStep}>
          <Tag color="teal">Webhook</Tag>
          <Mono dim size="xs">HTTP trigger to localhost</Mono>
        </div>
        <span className={styles.arrow}>→</span>
        <div className={styles.flowStep}>
          <Tag color="accent">OpenClaw</Tag>
          <Mono dim size="xs">Pipeline executes</Mono>
        </div>
      </div>

      <div className={styles.tabs}>
        {(Object.keys(scripts) as ScriptId[]).map(id => (
          <button
            key={id}
            className={[styles.tab, active === id ? styles.tabActive : ''].join(' ')}
            onClick={() => setActive(id)}
          >
            <Mono size="xs">{scripts[id].label}</Mono>
          </button>
        ))}
      </div>

      <div className={styles.script}>
        <Mono dim size="xs" className={styles.scriptDesc}>{scripts[active].desc}</Mono>
        <CodeBlock code={scripts[active].code} language="python" maxHeight={480} />
      </div>

      <div className={styles.envVars}>
        <Mono dim size="xs" className={styles.envLabel}>Required env vars</Mono>
        {['WEBHOOK_SECRET', 'OPENCLAW_PORT', 'TELEGRAM_BOT_TOKEN', 'ALLOWED_TELEGRAM_USER_ID', 'WEBHOOK_URL'].map(v => (
          <Tag key={v} color="dim">{v}</Tag>
        ))}
      </div>
    </div>
  );
}
