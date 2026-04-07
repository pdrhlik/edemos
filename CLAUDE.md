# eDemOS — Deliberative Survey Platform

## Project Overview

eDemOS is a deliberative survey platform (wiki survey) where participants rate statements as agree/disagree/abstain, mark them as important, and can submit new statements that enter the survey after moderation. Inspired by Pol.is and All Our Ideas but with structured demographics, mobile-native experience, moderation workflows, and commercial deployment options.

Website: https://e-demos.com/ | Part of the Academix ecosystem: https://www.academix.cz/edemos

## Tech Stack

- **Frontend**: Ionic / Angular / Capacitor (web-first, native iOS/Android later)
- **Backend**: Go (REST API, chi router, mibk/dali ORM)
- **Database**: MariaDB (singular table names)
- **Deployment**: Docker Compose (all services containerized, including the web frontend)
- **Web server**: Not included in Docker — services expose ports, host handles reverse proxy
- **Auth**: JWT tokens, email/password for MVP, OIDC interface for external providers later

## Repository Structure

```
edemos/
├── CLAUDE.md
├── docker-compose.yml          # production
├── docker-compose-dev.yml      # development
├── .env.example
├── .gitignore
├── client/                     # Ionic/Angular web app
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── environments/
│   │   └── theme/
│   ├── angular.json
│   ├── ionic.config.json
│   ├── package.json
│   └── capacitor.config.ts
├── server/                     # Go REST API
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── go.mod
│   ├── go.sum
│   ├── main.go
│   ├── config/
│   ├── handler/
│   ├── middleware/
│   ├── model/
│   ├── store/                  # database layer (mibk/dali)
│   └── service/
└── db/
    ├── schema.sql              # full schema, applied on first run
    └── migrations/             # incremental changes
```

## Coding Conventions

- **Go**: K&R style braces, chi router, mibk/dali ORM, singular table names, clean/simple patterns
- **Angular**: standalone components, signals where appropriate, SCSS
- **Database**: singular table names (`user`, `survey`, `statement`, `response`, `survey_participant`, `organization`)
- **Minimal targeted changes** over full file rewrites
- **Simple/readable solutions** over DRY complexity
- Do NOT use `\n` in Go for multiline SQL — use backticks

## Database Schema

MariaDB. All tables use singular names. `intake_config` and `intake_data` are JSON columns for fully configurable per-survey demographics.

### Core tables

```sql
CREATE TABLE organization (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    config JSON DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id INT UNSIGNED DEFAULT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) DEFAULT NULL,
    name VARCHAR(255) NOT NULL DEFAULT '',
    locale VARCHAR(10) NOT NULL DEFAULT 'en',
    role ENUM('user', 'super_admin') NOT NULL DEFAULT 'user',
    email_verified_at TIMESTAMP NULL DEFAULT NULL,
    notification_prefs JSON DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE survey (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id INT UNSIGNED DEFAULT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT DEFAULT NULL,
    status ENUM('draft', 'active', 'closed') NOT NULL DEFAULT 'draft',
    visibility ENUM('public', 'private', 'unlisted') NOT NULL DEFAULT 'private',
    privacy_mode ENUM('anonymous', 'public', 'participant_choice') NOT NULL DEFAULT 'anonymous',
    invitation_mode ENUM('none', 'admin_only', 'participants_can_invite') NOT NULL DEFAULT 'none',
    result_visibility ENUM('after_completion', 'continuous', 'after_close') NOT NULL DEFAULT 'after_completion',
    statement_order ENUM('random', 'sequential', 'least_voted') NOT NULL DEFAULT 'random',
    statement_char_min INT UNSIGNED NOT NULL DEFAULT 20,
    statement_char_max INT UNSIGNED NOT NULL DEFAULT 150,
    intake_config JSON DEFAULT NULL,
    closes_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE survey_participant (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    survey_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    role ENUM('participant', 'admin', 'moderator') NOT NULL DEFAULT 'participant',
    intake_data JSON DEFAULT NULL,
    privacy_choice ENUM('anonymous', 'public') DEFAULT NULL,
    invited_by INT UNSIGNED DEFAULT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY uq_survey_user (survey_id, user_id),
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE statement (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    survey_id INT UNSIGNED NOT NULL,
    text VARCHAR(500) NOT NULL,
    type ENUM('seed', 'user_submitted') NOT NULL DEFAULT 'seed',
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
    author_id INT UNSIGNED DEFAULT NULL,
    moderated_by INT UNSIGNED DEFAULT NULL,
    moderated_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES user(id) ON DELETE SET NULL,
    FOREIGN KEY (moderated_by) REFERENCES user(id) ON DELETE SET NULL,
    INDEX idx_survey_status (survey_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE response (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    statement_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    vote ENUM('agree', 'disagree', 'abstain') NOT NULL,
    is_important TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_statement_user (statement_id, user_id),
    FOREIGN KEY (statement_id) REFERENCES statement(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE email_verification (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_reset (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### intake_config example (JSON on survey)

```json
{
  "fields": [
    {
      "key": "age",
      "type": "select",
      "label": {"cs": "Jaký je váš věk?", "en": "What is your age?"},
      "options": [
        {"value": "18-24", "label": {"cs": "18-24", "en": "18-24"}},
        {"value": "25-34", "label": {"cs": "25-34", "en": "25-34"}}
      ],
      "required": true
    },
    {
      "key": "affiliation",
      "type": "radio",
      "label": {"cs": "Skupina", "en": "Group"},
      "options": [
        {"value": "student", "label": {"cs": "Student TUL", "en": "TUL Student"}},
        {"value": "alumni", "label": {"cs": "Absolvent TUL", "en": "TUL Alumni"}}
      ],
      "required": true,
      "conditionalFields": {
        "student": [
          {
            "key": "faculty",
            "type": "select",
            "label": {"cs": "Fakulta", "en": "Faculty"},
            "options": []
          }
        ]
      }
    }
  ]
}
```

## Docker Setup

### Development (docker-compose-dev.yml)

Services:
- **mariadb**: MariaDB with schema init, port 3307 on localhost
- **server**: Go API with hot reload (air), port 8080 on localhost
- **client**: Angular dev server (ng serve), port 4200 on localhost

Dev compose uses `.env` file (auto-loaded by Docker Compose).

### Production (docker-compose.yml)

Services:
- **mariadb**: MariaDB, port 3306 on 127.0.0.1
- **server**: Go binary (compiled), port 8080 on 127.0.0.1
- **client**: nginx serving built Angular static files, port 4200 on 127.0.0.1

Prod compose uses `.env.production` via `--env-file`.

No reverse proxy included — deployer handles routing (Caddy, nginx, Traefik, etc.)

### Environment variables (.env.example)

```
# MariaDB
MARIADB_ROOT_PASSWORD=changeme
MARIADB_PASSWORD=changeme

# Server
JWT_SECRET=changeme-min-32-chars
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@e-demos.com
BASE_URL=http://localhost:4200

# Client
API_URL=http://localhost:8080
```

## Auth Architecture

MVP: email/password with JWT. Go backend issues and validates tokens.

The auth layer is behind an interface so OIDC providers can be added later:
- Academix ecosystem central IdP (shared accounts across services)
- University SSO (TUL uses Shibboleth/SAML via eduID.cz federation)
- Corporate SSO (Azure AD, Google Workspace — all OIDC)
- Czech BankID

The Go backend only validates JWT. Where the JWT comes from is pluggable.

## User Roles

- **Participant**: rates statements, submits new ones, views results
- **Survey Admin**: creates/configures surveys, manages moderators, views all data
- **Moderator**: approves/rejects user-submitted statements
- **Super Admin**: platform-level management (us)

Participant/Admin/Moderator are per-survey roles (stored in survey_participant.role).
Super Admin is a global user role (stored in user.role).

## Survey Lifecycle

Simple state machine: `draft` → `active` → `closed`

- `draft`: survey is being configured, not visible to participants
- `active`: participants can join, rate, submit statements
- `closed`: no more responses, triggered by `closes_at` timestamp or manual close

No rounds, no pause/resume, no reopening.

## Key Configurable Features (per survey)

- **Privacy mode**: anonymous / public / participant_choice
- **Invitation mode**: none (open) / admin_only / participants_can_invite
- **Result visibility**: after_completion / continuous / after_close
- **Statement ordering**: random / sequential / least_voted
- **Statement character limits**: min/max (default 20-150)
- **Intake config**: fully configurable demographic questions (JSON schema)
- **Closing**: timestamp-based

## Deployment Models

1. **Public SaaS** (e-demos.com): single server, single DB. Mobile apps connect here by default.
2. **On-premise**: customer deploys Docker Compose stack on their infra. Custom branding, domain. Mobile apps connect via configurable instance URL.

Mobile apps (iOS/Android) are on App Store / Google Play only. Login screen has a server URL field (defaulting to e-demos.com).

## i18n

Translations follow the same approach used in the existing codebase. Czech and English for MVP. Translation keys in JSON files, Angular i18n pipeline.

## API Design

REST JSON API. All endpoints prefixed with `/api/v1/`.

Key endpoint groups:
- `POST /api/v1/auth/register`, `/login`, `/verify-email`, `/reset-password`
- `GET/POST /api/v1/survey` — list/create surveys
- `GET/PATCH /api/v1/survey/:id` — get/update survey
- `POST /api/v1/survey/:id/join` — join survey (fills intake)
- `GET/POST /api/v1/survey/:id/statement` — list/submit statements
- `POST /api/v1/statement/:id/response` — rate a statement
- `GET /api/v1/survey/:id/moderation` — moderation queue
- `PATCH /api/v1/statement/:id/moderate` — approve/reject

## Development Workflow

1. `docker-compose -f docker-compose-dev.yml up -d` — starts all services
2. Go server uses `air` for hot reload
3. Angular client uses `ng serve` with proxy to Go API
4. MariaDB schema applied via init script on first run
5. Migrations in `db/migrations/` for schema changes after initial setup
