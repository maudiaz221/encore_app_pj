# Encore.ts & Prisma ORM with EC2 Database

Set up an Ubuntu EC2 instance with two Postgres databases (`dev_db` and `shadow_db`), configure Prisma, and run your Encore app.

---

## 🔧 Prerequisites

* AWS EC2 (Ubuntu) instance
* SSH key (`.pem`)
* Node.js & npm installed
* Security group allowing SSH (port 22)

---

## 1. SSH into EC2 & Update

```bash
ssh -i path/to/your-key.pem ubuntu@your-ec2-instance-ip
sudo apt update && sudo apt upgrade -y
```

---

## 2. Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql
```

---

## 3. Create Databases & Roles

In the `postgres=#` prompt, run:

```sql
-- 1) Create the app role
CREATE ROLE root WITH LOGIN PASSWORD 'password';

-- 2) Create the main database (dev_db)
CREATE DATABASE dev_db OWNER root;

-- 3) Create the shadow database (shadow_db)
CREATE DATABASE shadow_db OWNER root;

-- 4) Connect to dev_db
\c dev_db

-- 5) Grant root full rights on public schema
GRANT USAGE, CREATE ON SCHEMA public TO root;

-- 6) Grant root privileges on existing objects
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO root;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO root;

-- 7) Ensure future objects inherit privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES    TO root;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO root;

-- 8) Exit psql
\q
```

---

## 4. Configure Remote Connections

1. **Edit** `postgresql.conf`:

   ```bash
   sudo nano /etc/postgresql/<version>/main/postgresql.conf
   # set:
   listen_addresses = '*'
   ```
2. **Edit** `pg_hba.conf`:

   ```bash
   sudo nano /etc/postgresql/<version>/main/pg_hba.conf
   # add:
   host    all             all             0.0.0.0/0               md5
   ```
3. **Restart** Postgres:

   ```bash
   sudo service postgresql restart
   ```

---

## 5. Environment Variables

Create a `.env` file in your project root:

```dotenv
DB_URL_EC2="postgresql://root:password@your-ec2-instance-ip:5432/dev_db?sslmode=require"
SHADOW_DB_URL="postgresql://root:password@your-ec2-instance-ip:5432/shadow_db?sslmode=require"
```

---

## 6. Prisma Setup

1. **Create** `prisma/schema.prisma`:

   ```prisma
   generator client {
     provider        = "prisma-client"
     output          = "./generated"
     previewFeatures = ["queryCompiler","driverAdapters"]
   }

   datasource db {
     provider          = "postgresql"
     url               = env("DB_URL_EC2")
     shadowDatabaseUrl = env("SHADOW_DB_URL")
   }

   model Product {
     id        String   @id @default(cuid())
     title     String
     price     Float
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }

   model User {
     id    Int    @id @default(autoincrement())
     email String @unique
     name  String
   }

   model Category {
     id   Int    @id @default(autoincrement())
     type String
   }
   ```
2. **Install** Prisma and generate client:

   ```bash
   npm install prisma @prisma/client
   npx prisma generate
   ```

---

## 7. Encore DB Config

1. **Create** `dbConfig.ts`:

   ```ts
   import { SQLDatabase } from "encore.dev/storage/sqldb";

   export const DB = new SQLDatabase("database-name", {
     migrations: {
       path: "./prisma/migrations",
       source: "prisma",
     },
   });
   ```
2. **Create** `database.ts`:

   ```ts
   export { DB } from "./dbConfig";
   ```

---

## 8. Prisma Client Adapter

In `prisma/client.ts`:

```ts
import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DB } from "../database";

export const prismaClient = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DB.connectionString }),
});

export * from "./generated/client";
```

---

## 9. Run Migrations & Start

```bash
npx prisma migrate dev --name init
encore run
```

Your API will be available at `http://127.0.0.1:4000`.
