Submission for Homework — Book Server

Overview
--------
This bundle contains the server code, integration tests, and CI workflow used to validate the implementation.

What I changed
https://mns4dh07-5173.euw.devtunnels.ms/
-------------
- Exported the Express `app` in `server/server.js` so tests can import the app without starting a network listener.
- Added integration tests: `server/test/integration.test.js` (3 read-only tests for `/`, `/api/v1/books`, `/api/v1/user`).
- Added dev test dependencies and a test script in `server/package.json`.
- Added GitHub Actions CI at `.github/workflows/ci.yml` to run `npm test` for the `server` folder.
- Added `server/README.md` with test instructions.

How to run locally (reproduce tests)
----------------------------------
From repository root run:

```bash
cd server
npm ci
NODE_ENV=test npm test
```

Expected results
----------------
- Local test run: `3 passing` (integration, read-only endpoints).

CI
--
The included workflow `.github/workflows/ci.yml` runs on push and pull requests to `main`/`master`. It:

- Checks out the repo
- Installs Node (18.x) and caches npm
- Runs `npm ci` in `server`
- Runs `npm test` in `server`

Submission bundle
-----------------
I included a ready-to-upload ZIP named `server_submission.zip` (if generated) which contains:

- `server/` — application source, tests, and README
- `.github/workflows/ci.yml` — CI workflow

If you need me to generate the ZIP file inside the repo now, I can — confirm and I'll create `server_submission.zip` at the repo root.

Contact
-------
If you want additional items in the submission (coverage report, protected-route tests, or a short video), tell me which and I'll add them.
