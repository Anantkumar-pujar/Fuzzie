# Disconnect Integration Feature

## Overview

Users can now disconnect integrations (Discord, Notion, Slack) from the Connections page. Google Drive remains always connected as the primary integration.

## Implementation

### Files Modified

1. **connection-card.tsx** - Updated to show Disconnect button for connected integrations
2. **disconnect-integrations.tsx** - New server actions for disconnecting each integration

### Features

#### 1. Dynamic Button States

**Not Connected:**
- Shows "Connect" button
- Redirects to OAuth flow

**Connected (Non-Primary):**
- Shows "Disconnect" button (destructive variant)
- Opens confirmation dialog on click

**Connected (Google Drive):**
- Shows "Connected" badge (read-only)
- Cannot be disconnected

#### 2. Confirmation Dialog

Before disconnecting, users see:
- **Title:** "Disconnect {Integration}?"
- **Warning:** Explains that automations will stop
- **Actions:** Cancel or Disconnect

#### 3. Server Actions

Each integration has a dedicated disconnect function:

**onDisconnectDiscord():**
- Deletes all Discord webhooks for user
- Deletes Discord connections

**onDisconnectNotion():**
- Deletes all Notion records for user
- Deletes Notion connections

**onDisconnectSlack():**
- Deletes all Slack records for user
- Deletes Slack connections

#### 4. User Feedback

- **Loading State:** Button shows "Disconnecting..." during action
- **Success:** Toast notification + page refresh
- **Error:** Toast with error message

## Usage

### Disconnect an Integration

1. Go to `/connections`
2. Find a connected integration (Discord, Notion, or Slack)
3. Click "Disconnect" button
4. Confirm in the dialog
5. Integration is removed and button changes to "Connect"

### Reconnect

After disconnecting, users can reconnect anytime by clicking "Connect" and going through the OAuth flow again.

## Security

- ✅ User authentication verified before disconnect
- ✅ Only deletes data for authenticated user
- ✅ Confirmation required before action
- ✅ Server-side validation

## Edge Cases Handled

- ✅ Google Drive cannot be disconnected (primary integration)
- ✅ Disabled state during disconnection prevents double-clicks
- ✅ Error handling with user-friendly messages
- ✅ Page refresh ensures UI reflects actual state

## Testing

### Test 1: Disconnect Discord
1. Connect Discord
2. Click Disconnect
3. Confirm dialog
4. **Expected:** Success toast, button shows "Connect"

### Test 2: Disconnect Notion
1. Connect Notion
2. Click Disconnect
3. Confirm dialog
4. **Expected:** Success toast, button shows "Connect"

### Test 3: Disconnect Slack
1. Connect Slack
2. Click Disconnect
3. Confirm dialog
4. **Expected:** Success toast, button shows "Connect"

### Test 4: Cancel Disconnect
1. Click Disconnect on any integration
2. Click Cancel in dialog
3. **Expected:** Dialog closes, integration still connected

### Test 5: Google Drive
1. Check Google Drive card
2. **Expected:** Shows "Connected" badge (not a button)
3. No disconnect option available

## Impact on Workflows

When an integration is disconnected:
- ✅ Related workflow nodes will show "Not connected"
- ✅ Workflows using that integration will fail to execute
- ✅ Users must reconnect and reconfigure workflows

## Benefits

1. **User Control:** Full control over connected apps
2. **Privacy:** Can revoke access anytime
3. **Testing:** Easy to reset and reconnect during development
4. **Security:** Remove compromised or unused integrations
