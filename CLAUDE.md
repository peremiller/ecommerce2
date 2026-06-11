# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository is a database schema source for a PHP/MySQL ecommerce application. The only runnable artifact is a MySQL dump at `sources/b20_ecommerce.sql`. There is no application code here — the `app/` directory was intended as a git submodule but has no `.gitmodules` config, so it is an untracked orphan entry in git.

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
