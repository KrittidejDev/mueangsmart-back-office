---
name: go_fiber_clean_arch
description: Architectural standards for building high-performance, memory-safe Go 1.25+ Fiber v3 backend services.
---

# Skill: Go 1.25+ Fiber v3 Clean Architecture & Zero Memory Leak

## Context & Purpose
The Go backend for `mueangsmart-back-office` must deliver enterprise ultra-low latency while eliminating memory leaks and race conditions.

## Architectural Guidelines

1. **Clean Architecture Layers:**
   - **Domain (`internal/domain`):** Pure interfaces, structs, and domain errors. No external framework dependencies.
   - **UseCase (`internal/usecase`):** Core business logic implementation. Interacts strictly with repository interfaces.
   - **Repository (`internal/repository`):** Database I/O layer. Implements domain repository interfaces using GORM or safe SQL drivers.
   - **Handler (`internal/handler`):** Fiber v3 request/response translation, query parsing, and status code formatting.

2. **Memory Safety & Performance Protocols:**
   - **No Unbounded Goroutines:** Always pass `context.Context` and handle cancellation.
   - **Type Safety & Zero `any`:** Avoid `interface{}` / `any` where strong typing is possible.
   - **Zero Fluff Code:** Omit obvious line comments. Keep code concise, clean, and idiomatic.
   - **Quality Check Command:**
     ```bash
     go vet ./...
     golangci-lint run ./...
     go test -v -race ./...
     ```
