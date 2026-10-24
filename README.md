# DSA Rank Board

DSA Rank Board is a full-stack dashboard for tracking competitive-programming progress across multiple platforms. Users sign in with Google, link their coding profiles, synchronize their latest statistics, and compare their weighted score on global and platform leaderboards.

## Features

- Google authentication with Firebase
- Link and manage profiles from:
  - LeetCode
  - Codeforces
  - CodeChef
  - GeeksforGeeks
- Fetch profile statistics from each supported platform
- View problems solved, ratings, platform scores, and total score
- Track score history with progress charts
- Browse global and platform-specific leaderboards
- View top coders by category
- Responsive dashboard UI with mobile navigation

## Tech stack

### Frontend

- React 19
- React Router
- Tailwind CSS
- Chart.js and `react-chartjs-2`
- Firebase Authentication
- Axios

### Backend

- Node.js 18+
- Express
- PostgreSQL
- Puppeteer and Cheerio for platform data collection
- Axios for external API requests

## Project structure

```text
dsa-rank-board/
├── client/                 # React frontend
│   ├── public/
│   └── src/
├── server/                 # Express API and data synchronization
│   ├── routes/
│   └── utils/
├── package.json
└── readme.md
```

## Prerequisites

Install the following before starting:

- Node.js 18 or later
- npm
- PostgreSQL
- A Firebase project with Google sign-in enabled

The backend expects the PostgreSQL tables used by the route and synchronization queries, including `users`, `user_profiles`, `user_platform_stats`, and `user_score_history`. Create those tables in your database before using the dashboard.

## Installation

Clone the repository and install dependencies for both applications:

```bash
git clone <your-repository-url>
cd dsa-rank-board

cd server
npm install

cd ../client
npm install
```

## Environment variables

### Backend

Create `server/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
NODE_ENV=development
```

`DATABASE_URL` must point to the PostgreSQL database containing the application tables.

### Frontend

Create `client/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=<firebase-api-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<firebase-auth-domain>
REACT_APP_FIREBASE_PROJECT_ID=<firebase-project-id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<firebase-storage-bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<firebase-messaging-sender-id>
REACT_APP_FIREBASE_APP_ID=<firebase-app-id>
```

Do not commit either `.env` file. They are ignored by the repository configuration.

In Firebase Console:

1. Open **Authentication → Sign-in method**.
2. Enable the **Google** provider.
3. Add the frontend origin, such as `http://localhost:3000`, to the authorized domains if required.

## Running locally

Start the backend in one terminal:

```bash
cd server
npm start
```

Start the frontend in a second terminal:

```bash
cd client
npm start
```

The frontend runs at [http://localhost:3000](http://localhost:3000), and the API runs on the port configured in `server/.env` (5000 in the example above).

The backend also includes a development script:

```bash
cd server
npm run dev
```

> The current `server/package.json` points this script at `indexs.js`. If you use it, update that script to `node --watch index.js` or install/configure the intended watcher first. `npm start` is the reliable default.

## API overview

All profile routes are prefixed with `/api/profile`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Create or register a Firebase user |
| `POST` | `/api/profile/link` | Validate and link a platform handle |
| `DELETE` | `/api/profile/delink` | Remove a linked platform |
| `POST` | `/api/profile/sync/:uid` | Synchronize linked platform statistics |
| `GET` | `/api/profile/stats/:uid` | Get a user's platform statistics |
| `GET` | `/api/profile/score/:uid` | Get a user's total score |
| `GET` | `/api/profile/score-history/:uid` | Get score history for charts |
| `GET` | `/api/profile/leaderboard` | Get the global leaderboard |
| `GET` | `/api/profile/leaderboard/:platform` | Get a platform leaderboard |
| `GET` | `/api/profile/top-coders/:type` | Get top coders for a category |
| `GET` | `/api/profile/public-profile/:username` | Get a public profile |

The backend calculates a weighted score using the platform weights defined in `server/utils/syncStats.js`:

| Platform | Weight | Primary metric |
| --- | ---: | --- |
| Codeforces | 0.4 | Rating |
| LeetCode | 0.3 | Problems solved |
| CodeChef | 0.2 | Rating |
| GeeksforGeeks | 0.1 | Problems solved |

## Production build

Build the frontend:

```bash
cd client
npm run build
```

The optimized files are generated in `client/build`.

Start the backend with production configuration:

```bash
cd server
$env:NODE_ENV="production"
npm start
```

On macOS/Linux, use `NODE_ENV=production npm start` instead.

## Testing

Run the frontend test suite:

```bash
cd client
npm test
```

Run a single non-watch test execution:

```bash
npm test -- --watchAll=false
```

## Troubleshooting

- **The frontend cannot reach the API:** verify `REACT_APP_BACKEND_URL`, the backend port, and that both applications are running.
- **Google sign-in fails:** verify that Google authentication is enabled in Firebase and that the frontend origin is authorized.
- **Database connection errors:** verify `DATABASE_URL`, PostgreSQL availability, and that the required tables exist.
- **A profile cannot be linked:** confirm that the platform handle is public and spelled exactly as it appears on the platform.
- **Platform data is unavailable:** external platform APIs and pages can change or rate-limit requests; check the backend logs for the failing provider.

## Contributing

1. Create a feature branch.
2. Keep frontend and backend changes focused.
3. Never commit credentials or environment files.
4. Run the relevant frontend tests and production build before opening a pull request.

## License

No license has been specified yet. Add a license file before distributing or reusing this project publicly.
