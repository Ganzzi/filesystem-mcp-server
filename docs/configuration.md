# Configuration

## Core Settings
- `MCP_SERVER_NAME`: optional override for the server name.
- `MCP_SERVER_VERSION`: optional override for the server version.
- `MCP_LOG_LEVEL`: log level, defaults to `debug`.
- `LOGS_DIR`: log output directory, defaults to `./logs`.
- `NODE_ENV`: runtime environment, defaults to `development`.

## Transport
- `MCP_TRANSPORT_TYPE`: `stdio` or `http`, defaults to `stdio`.
- `MCP_HTTP_PORT`: port for HTTP transport, defaults to `3010`.
- `MCP_HTTP_HOST`: host for HTTP transport, defaults to `127.0.0.1`.
- `MCP_ALLOWED_ORIGINS`: comma-separated CORS allowlist.
- `MCP_AUTH_SECRET_KEY`: required for secure HTTP auth in production.

## Filesystem Boundary
- `FS_BASE_DIRECTORY`: optional base directory that constrains filesystem access.

## LLM / OAuth Integrations
The config module also exposes optional OpenRouter, Gemini, and OAuth proxy settings used by the broader server implementation.
