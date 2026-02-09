# Auth0 Actions Setup

## Overview

Your backend expects a webhook at `/api/users/auth0-webhook-create` with:
- **Authorization Header**: `Bearer <AUTH0_WEBHOOK_SECRET>`
- **Payload**: `{ email, user_id, given_name, family_name }`

---

## Action 1: Post-Login Action (for all logins including social)

**Name**: `Sync User to Backend`  
**Trigger**: `Login / Post Login`

```javascript
exports.onExecutePostLogin = async (event, api) => {
  // Only sync on first login or if user doesn't exist in backend yet
  // You can add custom logic here to check if user needs syncing
  
  const axios = require('axios');
  
  const backendUrl = event.secrets.BACKEND_URL || 'https://ottero.com.au';
  const webhookSecret = event.secrets.WEBHOOK_SECRET;
  
  const payload = {
    email: event.user.email,
    user_id: event.user.user_id,
    given_name: event.user.given_name || event.user.name?.split(' ')[0] || 'User',
    family_name: event.user.family_name || event.user.name?.split(' ').slice(1).join(' ') || ''
  };
  
  try {
    await axios.post(`${backendUrl}/api/users/auth0-webhook-create`, payload, {
      headers: {
        'Authorization': `Bearer ${webhookSecret}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    console.log(`User synced: ${event.user.email}`);
  } catch (error) {
    // Don't block login if sync fails - user might already exist (204 response)
    if (error.response?.status !== 204) {
      console.error(`User sync failed: ${error.message}`);
    }
  }
};
```

### Secrets to configure:
| Secret Name | Value |
|-------------|-------|
| `BACKEND_URL` | `https://ottero.com.au` |
| `WEBHOOK_SECRET` | Your `AUTH0_WEBHOOK_SECRET` value |

### Dependencies:
Add `axios` (version `1.6.0` or latest)

---

## Action 2: Post-User-Registration (for database connections only)

**Name**: `Create User on Signup`  
**Trigger**: `Post User Registration`

```javascript
exports.onExecutePostUserRegistration = async (event) => {
  const axios = require('axios');
  
  const backendUrl = event.secrets.BACKEND_URL || 'https://ottero.com.au';
  const webhookSecret = event.secrets.WEBHOOK_SECRET;
  
  const payload = {
    email: event.user.email,
    user_id: event.user.user_id,
    given_name: event.user.given_name || 'User',
    family_name: event.user.family_name || ''
  };
  
  try {
    const response = await axios.post(`${backendUrl}/api/users/auth0-webhook-create`, payload, {
      headers: {
        'Authorization': `Bearer ${webhookSecret}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    console.log(`User created in backend: ${event.user.email}, Status: ${response.status}`);
  } catch (error) {
    console.error(`Failed to create user in backend: ${error.message}`);
    // Don't throw - let registration complete even if backend sync fails
  }
};
```

---

## Setup Instructions

1. Go to **Auth0 Dashboard → Actions → Library → Create Action**
2. Choose the trigger type (`Post Login` or `Post User Registration`)
3. Paste the code above
4. Add **Secrets**:
   - `BACKEND_URL`: `https://ottero.com.au`
   - `WEBHOOK_SECRET`: *(same as `auth0.webhook.secret` in your backend)*
5. Add **Dependency**: `axios@1.6.0`
6. **Deploy** the action
7. Go to **Actions → Flows** and add the action to the flow

---

## Important Notes

- **Post-Login** is recommended because it works for ALL login methods (social + database)
- **Post-User-Registration** only triggers for database connections, NOT social logins
- Your backend handles duplicates gracefully (returns 204 if user exists)
