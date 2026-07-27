---
name: db_safety_protocol
description: Rules and guidelines for safe PostgreSQL database interactions without raw SQL mutations or modifying production schema.
---

# Skill: Database Safety & Zero-Migration Protocol

## Context & Purpose
This skill governs all database interactions within `mueangsmart-back-office`. The database contains critical production data from `MueangSmart-DumpFromVM`. Any unintended schema changes or raw SQL execution can break existing web and mobile apps.

## Key Directives

1. **Zero Auto-Migration on Existing Tables & Naming Alignment:**
   - NEVER execute DDL migrations (`ALTER TABLE`, `DROP TABLE`, `TRUNCATE`) on existing tables (`Municipalities`, `AdminUsers`, `MunicipalityModules`, `UserMunicipalities`, etc.).
   - New back-office tables MUST be isolated using the `Bo` prefix and MUST follow the existing DB pattern: **PascalCase Plural Table Names** and **PascalCase Column Names** (e.g. `BoSuperAdmins`, `BoRoles`, `BoPermissions`, `BoAuditLogs`, with columns `Id`, `CreatedDate`, `CreatedBy`, `UpdatedDate`, `UpdatedBy`).

2. **No Unsafe Raw SQL Mutations:**
   - Avoid executing raw string SQL queries for `INSERT`, `UPDATE`, or `DELETE`.
   - All mutations must be executed through Go Backend ORM (GORM/Ent) inside explicit transactions (`tx := db.Begin()`).

3. **Read-Only Analytics Queries:**
   - When pulling analytical or aggregated metrics from existing tables, use indexed read-only queries.
   - Use `SELECT ... WHERE ...` with proper limits and pagination to avoid DB locks.

4. **Escalation Trigger:**
   - If a feature requires modifying an existing production table structure, STOP and consult the Senior Architect or User first.
