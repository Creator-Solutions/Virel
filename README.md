# Virel — Laravel + React Deployment Platform

## Introduction

Virel is a self-hosted Laravel application for automated GitHub-based deployments. It provides a modern React frontend using Inertia.js for managing projects, deployments, and environment variables.

## Features

### Authentication

- Email/password authentication with session-based login
- Password reset flow (forgot password → reset password)
- Route-level auth middleware protection

### Projects

- **List Projects** — Paginated table view with status indicators
- **Create Project** — Multi-section form:
  - General: name, public URL (optional)
  - Deploy Path: absolute server path for deployments
  - GitHub: owner, repository, branch, personal access token (optional)
  - Webhook: auto-generated secret displayed with copy/reveal/regenerate options
- **Project Detail** — Overview with latest deployment, recent deployments, artifact count
- **Project Settings** — Edit all project fields, view webhook configuration, regenerate webhook secret, delete project (with confirmation modal)
- **Environment Variables** — Create, edit, delete per-project environment variables

### Deployments

- **Deployment History** — List of all deployments with status, trigger type, branch, commit info
- **Deployment Detail** — Full deployment output/logs, triggered by info
- **Rollback** — Restore to previous deployment artifacts

### User Management

- **User List** — Admin view of all users
- **Edit User** — Update user details and role

### API Endpoints

REST API at `/api/v1/` with Sanctum authentication:

- `POST /api/v1/projects` — Create project
- `GET /api/v1/projects` — List projects (paginated)
- `GET /api/v1/projects/{id}` — Get project details
- `PATCH /api/v1/projects/{id}` — Update project
- `DELETE /api/v1/projects/{id}` — Delete project
- `POST /api/v1/projects/{id}/deploy` — Trigger deployment
- `POST /api/v1/projects/{id}/regenerate-secret` — Regenerate webhook secret
- `POST /api/v1/projects/{id}/rollback/{artifactId}` — Rollback to artifact

### Tech Stack

- **Backend**: Laravel 12, Domain-Driven Design, Repository pattern
- **Frontend**: React 18, TypeScript, Inertia.js, TailwindCSS
- **Architecture**: Atomic Design (atoms → molecules → organisms → pages)
- **State Management**: Zustand
- **Authentication**: Laravel Sanctum

## Project Structure

```
app/
├── Domain/              # Business logic layer
│   └── Projects/       # Project domain (contracts, entities)
├── Http/
│   ├── Controllers/
│   │   ├── Api/        # REST API controllers
│   │   └── Web/        # Inertia page controllers
├── Infrastructure/
│   └── Persistence/    # Eloquent models, repositories
resources/js/
├── domains/            # Frontend domain types & services
├── pages/              # Inertia page components
└── src/
    └── components/
        ├── atoms/      # Basic UI elements (Button, Input, etc.)
        ├── molecules/  # Composite components (FormField, etc.)
        └── organisms/   # Complex sections (forms, tables)
```

## License

The Virel application is open-sourced software licensed under the MIT license.
