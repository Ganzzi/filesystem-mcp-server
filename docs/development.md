# Development Guide

## Prerequisites
- Node.js 16+
- npm

## Setup
```bash
npm install
npm run build
```

## Unit Tests (PR Gate)
```bash
npm test
```

## Coverage
```bash
npm run test:cov
```

## Runtime Modes
```bash
npm start
MCP_TRANSPORT_TYPE=stdio npm start
MCP_TRANSPORT_TYPE=http npm start
```

## Notes
- The server supports both STDIO and HTTP transports.
- HTTP transport requires `MCP_AUTH_SECRET_KEY` in production.
- Filesystem access is always resolved through `serverState.resolvePath(...)`.
