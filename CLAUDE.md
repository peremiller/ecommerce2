# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains:

- `index.html` — a self-contained ecommerce web app ("B20 Shop") that implements the b20_ecommerce schema entirely client-side (vanilla JS + localStorage, no build step). It is served via GitHub Pages at https://peremiller.github.io/ecommerce2/. Demo accounts: `admin / admin123` (admin) and `demo / demo123` (customer). Passwords are demo-grade only — do not reuse this auth pattern for real credentials.
- `sources/b20_ecommerce.sql` — the original MySQL dump the app's data model mirrors (tables: roles, statuses, payment_modes, categories, items, users, orders, orders_items). The `app/` directory was intended as a git submodule but has no `.gitmodules` config, so it is an untracked orphan entry in git.

The web app follows the schema faithfully: `orders_items.price` snapshots price at purchase time, `orders.transaction_code` is a unique 12-char code, usernames/emails are unique, and lookup values (roles, statuses, payment modes, categories) match the SQL seed rows.

## Database Setup

Import the schema into a MariaDB/MySQL instance (tested against MariaDB 10.1.37):

```bash
mysql -u <user> -p b20_ecommerce < sources/b20_ecommerce.sql
```

The database name is `b20_ecommerce`.

## Schema Architecture

The schema models a simple ecommerce platform with role-based users, categorized products, and tracked orders.

**Entity relationships:**

```
roles ←── users ──→ orders ──→ statuses
                       │
                       └──→ payment_modes
                       │
                  orders_items ──→ items ──→ categories
```

**Key design notes:**
- `orders_items.price` stores the price *at time of purchase* (denormalized intentionally — `items.price` can change).
- `orders.transaction_code` is a unique 12-character string (external reference, not the auto-increment `id`).
- `users.username` and `users.email` are both unique.
- `items.image_path` has a unique constraint — one file path per product image.
- All lookup/enum-style values (`roles`, `statuses`, `payment_modes`) are normalized into their own tables rather than stored as strings.
- Character set is `latin1` throughout (not `utf8mb4`) — be aware of this if adding support for non-Latin characters.
