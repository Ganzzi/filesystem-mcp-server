import jwt
import os
from datetime import datetime, timedelta

# Load the secret from environment (never hardcode it!)
secret_key = os.getenv("MCP_AUTH_SECRET_KEY")
if not secret_key:
    raise ValueError("MCP_AUTH_SECRET_KEY environment variable is required")

# Define the payload (customize as needed)
payload = {
    "cid": "test-client",  # client_id
    "scp": ["read", "write"],  # scopes (permissions)
    "sub": "test-session",  # subject/session id
    "iat": int(datetime.now().timestamp()),  # issued at (current time)
    "exp": int((datetime.now() + timedelta(hours=1)).timestamp()),  # expires in 1 hour
}

# Generate the JWT
try:
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    print(f"Generated JWT Token: {token}")
except Exception as e:
    print(f"Error generating JWT: {e}")
    exit(1)
