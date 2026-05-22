#!/usr/bin/env python3
"""
Seed the Supabase backlog_items table from product_backlog_full.html.

Usage:
  1. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
     are set in .env.local (already done).
  2. Run: python3 scripts/seed.py

After the table is created in Supabase SQL editor, run this once to load all 80 items.
It uses UPSERT (on linear_id conflict) so it's safe to run multiple times.
Items without a linear_id get inserted as new rows each time — deduplicate by
checking the Supabase table if you re-run.
"""

import re, json, os, urllib.request, urllib.error, sys

# ── Config ──────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://qlrqxqqxrveddvkxkjqh.supabase.co"
ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscnF4cXF4cnZlZGR2a3hranFoIiwicm9sZSI6ImFub24iLCJ"
    "pYXQiOjE3Nzk0NDk5ODAsImV4cCI6MjA5NTAyNTk4MH0."
    "q06RYh3bj4PxCNh0u4KiLE4Erq-iZzpe8UZenmfWP0A"
)

# Adjust path if running from repo root vs scripts/
HTML_PATHS = [
    "/Users/zocket/Desktop/Jetin's Brain/Jetin's Brain/raw-sources/product_backlog_full.html",
    "../raw-sources/product_backlog_full.html",
    "raw-sources/product_backlog_full.html",
]

# ── Customers list for keyword scanning ─────────────────────────────────────
CUSTOMERS = [
    'Bata', 'Dabur', 'Croma', 'Chola', '5paisa', 'IIFL', 'EloElo', 'Ambercomm',
    'Lenskart', 'Myntra', 'Reliance', 'Hush Puppies', 'Vidhi', 'Elevate',
    'Librium', 'Alo', 'Omaza', 'Ajio', 'Nykaa', 'Meesho',
]

MODULE_MAP = {
    'bi': 'bi', 'orm': 'orm', 'creative': 'creative', 'perf': 'perf',
    'legacy': 'legacy', 'team': 'team', 'integrations': 'integrations',
    'settings': 'settings', 'others': 'others',
}

OWNER_MAP = {
    'jetin': 'jetin', 'prem': 'prem', 'gayathri': 'gayathri', 'raghav': 'raghav',
    'shared_prem': 'prem', 'shared_jetin': 'jetin', 'shared': 'jetin',
}

def strip_tags(s):
    return re.sub(r'<[^>]+>', '', s).strip()

def parse_items(html_path):
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    row_pattern = re.compile(
        r'<tr\s+data-module="([^"]+)"\s+data-owner="([^"]+)"\s+'
        r'data-priority="([^"]+)"\s+data-status="([^"]+)"\s+data-linear="([^"]+)">(.*?)</tr>',
        re.DOTALL
    )

    items = []
    for m in row_pattern.finditer(content):
        module, owner, priority, status, _, row_html = m.groups()

        module = MODULE_MAP.get(module, 'others')
        owner  = OWNER_MAP.get(owner.lower(), 'jetin')

        title_m  = re.search(r'class="item-title">(.*?)(?:<br|</div)', row_html, re.DOTALL)
        detail_m = re.search(r'class="item-detail">(.*?)</span>', row_html, re.DOTALL)
        when_m   = re.search(r'class="item-when">(.*?)</span>', row_html, re.DOTALL)
        lin_m    = re.search(r'class="lin-link[^"]*">([A-Z]+-\d+)</a>', row_html)

        title  = strip_tags(title_m.group(1)).strip() if title_m else ''
        detail = strip_tags(detail_m.group(1)).strip() if detail_m else None
        linear_id = lin_m.group(1) if lin_m else None

        customers = []
        if when_m:
            when_text = strip_tags(when_m.group(1))
            dash_m = re.search(r'—\s*(.+)', when_text)
            if dash_m:
                cust_clean = re.split(r'[+(,]', dash_m.group(1).strip())[0].strip()
                if cust_clean:
                    customers.append(cust_clean)

        combined = (title + ' ' + (detail or '')).lower()
        for c in CUSTOMERS:
            if c.lower() in combined and c not in customers:
                customers.append(c)

        if not title:
            continue

        items.append({
            'linear_id': linear_id,
            'title': title,
            'detail': detail,
            'module': module,
            'owner': owner,
            'priority': priority,
            'status': status,
            'customers': customers,
            'has_linear': linear_id is not None,
            'suggested_due': None,
            'roadmap_quarter': None,
            'roadmap_notes': None,
            'workflow': {},
            'manually_overridden': False,
            'last_linear_sync': None,
        })

    return items

def upsert(items):
    url = f"{SUPABASE_URL}/rest/v1/backlog_items"
    headers = {
        'apikey': ANON_KEY,
        'Authorization': f'Bearer {ANON_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
    }

    # Supabase supports bulk upsert; send all at once
    # linear_id is the conflict column (null rows just insert)
    body = json.dumps(items).encode()
    req = urllib.request.Request(url, data=body, headers=headers, method='POST')
    req.add_header('Prefer', 'resolution=merge-duplicates,return=minimal')

    try:
        with urllib.request.urlopen(req) as r:
            print(f"✅ Upserted {len(items)} items — HTTP {r.status}")
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"❌ HTTP {e.code}: {err}")
        sys.exit(1)

if __name__ == '__main__':
    html_path = None
    for p in HTML_PATHS:
        if os.path.exists(p):
            html_path = p
            break
    if not html_path:
        print("❌ Could not find product_backlog_full.html. Check HTML_PATHS in this script.")
        sys.exit(1)

    print(f"📄 Reading: {html_path}")
    items = parse_items(html_path)
    print(f"🔍 Parsed {len(items)} items")
    upsert(items)
