# Server — Tests & CI
https://mns4dh07-3000.euw.devtunnels.ms/
Short instructions to run the project's tests locally and what the GitHub Actions CI does.

## Running tests locally

1. Open a terminal and change to the server folder:

```bash
cd server
```

2. Install dependencies:

```bash
npm ci
```

3. Run the tests (recommended to set `NODE_ENV=test` so the app does not call `listen`):

```bash
NODE_ENV=test npm test
```

Notes:
- The integration tests exercise read-only endpoints and require the database (configured via environment variables or the defaults in `DB/dbcon.js`) to be reachable. Set `DB_HOST`, `DB_USER`, `DB_PASS`, and `DB_NAME` in the environment if needed.

## Continuous Integration (GitHub Actions)

A workflow is included at `.github/workflows/ci.yml`. On pushes and pull requests to `main`/`master` it:

- Checks out the repository
- Uses Node.js 18
- Runs `npm ci` in the `server` folder
- Runs `npm test` in the `server` folder

To reproduce the CI run locally, run the same commands in the `server` folder (CI uses `npm ci` then `npm test`).

## Troubleshooting

- If tests fail due to database connectivity, either start a MySQL instance reachable at the configured host, or set environment variables to point to a test DB before running the tests.
- To prevent the server from calling `listen` while testing, ensure `NODE_ENV=test` is set when running tests.

## Files touched for testing & CI

- `server/test/integration.test.js` — integration tests (read-only)
- `server/package.json` — test script and devDependencies
- `server/server.js` — app exported for testing
- `.github/workflows/ci.yml` — CI workflow

---
Created to make running and verifying tests straightforward for local and CI environments.

## Submission bundle

A submission bundle (`server_submission.zip`) is created and contains the `server` folder and the CI workflow (`.github/workflows/ci.yml`). The bundle includes:

- Application source: `server/`
- Tests: `server/test/`
- Test helper config: `server/package.json` and `server/README.md`
- CI workflow: `.github/workflows/ci.yml`

To generate the same bundle locally (from the repository root):

```bash
zip -r server_submission.zip server .github/workflows/ci.yml
```

Deliverable notes:
- Tests pass locally: 3 passing (integration, read-only endpoints).
- CI will run the same `npm test` in the `server` directory on push/PR to `main`/`master`.
# Book Server

API documentation is available via Swagger UI when the server is running.

Quick start

```bash
cd server
npm install
npm start
```

Open the docs at: http://localhost:3000/api-docs

Security

- Endpoints that require authentication use a Bearer JWT token. In Swagger UI click "Authorize" and enter `Bearer <your-jwt>` (only the token is required in the input box).

Notes

- Routes are mounted under `/api/v1` (for example `/api/v1/books`).
- If you use file upload when creating a book, use multipart/form-data and the `image` field.
