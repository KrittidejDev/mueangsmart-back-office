---
name: deep_analytics_monitoring
description: Patterns for aggregating deep population stats, vulnerable groups, registration approvals, and multi-channel traffic metrics.
---

# Skill: Deep Analytics & Multi-Tenant Monitoring

## Context & Purpose
Back Office requires deep monitoring across all onboarded cities. This includes vulnerable populations (elderly, disabled, bedridden), user registration approval pipelines, module SLAs, and Web vs Mobile app traffic analytics.

## Technical Implementation Guide

1. **Vulnerable Groups Metrics Aggregation:**
   - Query counts from `ModuleElderlyAndDisabled` and `ModuleBedriddenPatient` grouped by `MunicipalityId`.
   - Track evaluation status (Assessed vs Pending Assessment) and active assistance request activities.

2. **User Registration & Approval Pipeline:**
   - Aggregate `UserMunicipalities` to track registration counts by status:
     - `Approved`
     - `Pending Approval`
     - `Rejected`
   - Compute city-by-city population registration ratios.

3. **Module Operational Analytics:**
   - **Complaints:** Aggregate total complaints, status breakdown (Received / In-Progress / Resolved), and SLA resolution time.
   - **Waste Fees & Tax Payments:** Sum billing amounts, total collected, and pending verification counts.
   - **River & Flood Sensors:** Aggregate device threshold logs and active alert counts.

4. **Performance & Caching Strategy:**
   - Heavy aggregate queries MUST use in-memory TTL caching (60s) or materialization strategies to avoid overwhelming the production database during peak hours.
