# Notion Integration - Complete Setup Guide

## 🎯 Overview

This guide explains how to set up, configure, and use Notion integration in Fuzzie to automatically create pages in your Notion database from your workflows.

---

## 📋 Prerequisites

1. **Notion Account** - You need a Notion account (free or paid)
2. **Notion Integration Created** - Create a Notion integration in your workspace
3. **Database Access** - The integration must have access to your target database

---

## 🔧 Part 1: Create Notion Integration

### Step 1: Create Integration in Notion

1. **Go to Notion Integrations Page:**
   - Visit: https://www.notion.so/my-integrations
   - Log in with your Notion account

2. **Create New Integration:**
   - Click "**+ New integration**"
   - **Name:** `Fuzzie Workflow Automation`
   - **Associated workspace:** Select your workspace
   - **Type:** Internal integration
   - Click "**Submit**"

3. **Copy Integration Token:**
   - After creation, you'll see an "**Internal Integration Token**"
   - Click "**Show**" and copy the token
   - Save it securely (starts with `secret_`)

4. **Configure Capabilities:**
   - Under "Capabilities" section:
     - ✅ Read content
     - ✅ Update content
     - ✅ Insert content
   - Click "**Save changes**"

### Step 2: Share Database with Integration

1. **Open Your Notion Database:**
   - Go to the Notion page with your database
   - Can be a table, board, list, calendar, etc.

2. **Share with Integration:**
   - Click "**•••**" (three dots) in the top-right
   - Click "**Add connections**"
   - Search for "**Fuzzie Workflow Automation**" (your integration name)
   - Click to add it
   - Now your integration has access!

### Step 3: Get Database ID

**Method 1: From Database URL**

When viewing your database in Notion, the URL looks like:
```
https://www.notion.so/<workspace>/<database_id>?v=<view_id>
```

Example:
```
https://www.notion.so/myworkspace/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6?v=...
                                 ↑ This is your database ID ↑
```

Copy the 32-character string (without hyphens): `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**Method 2: From Share Link**

1. Click "**Share**" in top-right of database
2. Click "**Copy link**"
3. The database ID is the first part of the path

---

## 🔗 Part 2: Connect Notion to Fuzzie

### Step 1: Configure OAuth Callback

Make sure your `.env` file has the Notion credentials:

```env
# Notion OAuth
NOTION_CLIENT_ID=your_client_id_here
NOTION_CLIENT_SECRET=your_client_secret_here
NOTION_REDIRECT_URI=https://your-domain.com/api/auth/callback/notion

# Or for local development:
# NOTION_REDIRECT_URI=http://localhost:3000/api/auth/callback/notion
```

### Step 2: Connect via Connections Page

1. **Navigate to Connections:**
   - Go to http://localhost:3000/connections
   - Or click "Connections" in the sidebar

2. **Click "Connect" on Notion Card:**
   - Find the Notion connection card
   - Click the "Connect" button

3. **Authorize in Notion:**
   - You'll be redirected to Notion
   - Click "**Select pages**"
   - Choose the database you shared with the integration
   - Click "**Allow access**"

4. **Verify Connection:**
   - You'll be redirected back to Fuzzie
   - The Notion card should now show "Connected"

### Step 3: Verify Database Configuration

After connecting, verify your Notion connection has the database ID:

**Check in Database:**
```sql
-- Using Prisma Studio or your database tool
SELECT * FROM "Notion" WHERE "userId" = 'your_clerk_user_id';
```

**Required Fields:**
- ✅ `accessToken` - Should have value
- ✅ `workspaceId` - Should have value
- ✅ `databaseId` - **MUST HAVE VALUE** (this is critical!)
- ✅ `workspaceName` - Should have value

---

## 🎨 Part 3: Use Notion in Workflows

### Step 1: Create a Workflow

1. **Go to Workflows Page:**
   - Navigate to http://localhost:3000/workflows
   - Click "**Create Workflow**"

2. **Name Your Workflow:**
   - Give it a descriptive name
   - Example: "Save GitHub Commits to Notion"

### Step 2: Add Notion Action Node

1. **Open Workflow Editor:**
   - Click on your new workflow to open the editor

2. **Add Trigger Node:**
   - Drag "**Google Drive**" or "**GitHub**" from sidebar
   - Place it on the canvas
   - This will trigger your workflow

3. **Add Notion Action:**
   - Drag "**Notion**" from sidebar
   - Place it on the canvas after your trigger
   - Connect the trigger to Notion node

### Step 3: Configure Notion Node

1. **Click on Notion Node:**
   - Click the Notion node on the canvas
   - Right panel will open with configuration

2. **Check Connection Status:**
   - Should show: "✅ Connected"
   - If showing "Not connected":
     - Go back to Connections page
     - Reconnect Notion
     - Refresh the editor

3. **Enter Content:**
   - In the "Values to be stored" input field
   - Enter the content you want to save
   - Can use template variables (see below)

4. **Test the Connection:**
   - Click "**Test**" button
   - Should create a test page in your Notion database
   - Check your Notion database to verify

5. **Save Template:**
   - After testing successfully
   - Click "**Save Template**" button
   - This saves your configuration

### Step 4: Publish Workflow

1. **Click Publish:**
   - In the top-right corner
   - Click the "**Publish**" button
   - Workflow is now active!

---

## 🔬 Part 4: Testing Notion Integration

### Test 1: Manual Test in Editor

1. **Go to Workflow Editor**
2. **Click Notion Node**
3. **Enter Test Content:**
   ```
   Test page created at 2:30 PM
   ```
4. **Click "Test" Button**
5. **Check Results:**
   - Should see success toast message
   - Check your Notion database
   - New page should appear with title "Test page created at 2:30 PM"

### Test 2: Template Variables (Advanced)

For dynamic content based on triggers:

**GitHub Trigger Example:**
```
New commit: {{commit_message}}
Author: {{author}}
SHA: {{commit_sha}}
Repository: {{repository}}
Branch: {{branch}}
```

**Google Drive Trigger Example:**
```
File uploaded: {{fileName}}
Type: {{mimeType}}
Size: {{fileSize}}
Uploaded at: {{timestamp}}
```

### Test 3: Live Workflow Test

1. **Trigger the Workflow:**
   - For GitHub: Make a commit to connected repo
   - For Google Drive: Upload a file to watched folder

2. **Check Execution:**
   - Go to http://localhost:3000/logs
   - Find your workflow execution
   - Check status (should be "Success")

3. **Verify in Notion:**
   - Open your Notion database
   - New page should be created with trigger data

---

## 🐛 Troubleshooting

### Error: "Database ID is required but was empty or undefined"

**Cause:** Notion connection doesn't have a database ID configured.

**Solutions:**

1. **Reconnect Notion:**
   ```
   - Go to Connections page
   - Click "Disconnect" on Notion (if connected)
   - Click "Connect" again
   - Select the database during OAuth flow
   ```

2. **Verify Database Access:**
   ```
   - Open your Notion database
   - Click "•••" → "Add connections"
   - Ensure your integration is listed
   ```

3. **Check Database:**
   ```sql
   SELECT * FROM "Notion" WHERE "userId" = 'your_user_id';
   -- Verify databaseId field is not NULL or empty
   ```

4. **Manual Fix (if needed):**
   ```sql
   UPDATE "Notion" 
   SET "databaseId" = 'your-database-id-here'
   WHERE "userId" = 'your_clerk_user_id';
   ```

### Error: "Notion access token is missing"

**Cause:** Access token expired or not saved.

**Solution:**
- Go to Connections page
- Reconnect Notion
- Complete OAuth flow again

### Error: "Database not found"

**Cause:** Integration doesn't have access to the database.

**Solution:**
1. Open your Notion database
2. Click "•••" → "Add connections"
3. Add your integration
4. Try again

### Error: "Unauthorized access to Notion"

**Cause:** Integration token is invalid or expired.

**Solutions:**
1. Create new integration token in Notion settings
2. Update your `.env` file
3. Reconnect in Fuzzie

### Error: "Please enter some content to save to Notion"

**Cause:** The content field is empty.

**Solution:**
- Enter some text in the "Values to be stored" input
- Cannot save empty pages to Notion

---

## 📊 Notion Database Requirements

### Required Property: Name (Title)

Your Notion database **MUST** have a "Name" property (title type):

**Check Your Database:**
1. Open database in Notion
2. Look at the first column
3. Should have a column named "Name" with type "Title"

**If Missing:**
1. Click "**+**" to add new property
2. Name it "**Name**"
3. Set type to "**Title**"
4. This is required for the integration to work

### Recommended Additional Properties

For richer data storage, add these properties:

| Property Name | Type | Purpose |
|---------------|------|---------|
| **Name** | Title | ✅ Required - Main content |
| Created At | Date | Track when page was created |
| Source | Select | Track trigger source (GitHub, Drive, etc.) |
| Workflow | Relation | Link to workflow that created it |
| Status | Status | Track processing status |
| Content | Text | Full content if needed |

---

## 🔄 Workflow Examples

### Example 1: GitHub Commits to Notion

**Trigger:** GitHub
**Action:** Notion

**Notion Template:**
```
🚀 {{commit_message}}

👤 Author: {{author}} ({{author_email}})
📝 SHA: {{commit_sha}}
🗂️ Repository: {{repository}}
🌿 Branch: {{branch}}
⏰ Time: {{timestamp}}
```

**Result in Notion:**
```
🚀 Fix login bug

👤 Author: John Doe (john@example.com)
📝 SHA: a1b2c3d
🗂️ Repository: my-awesome-app
🌿 Branch: main
⏰ Time: 2026-01-02T10:30:00Z
```

### Example 2: Google Drive Uploads to Notion

**Trigger:** Google Drive
**Action:** Notion

**Notion Template:**
```
📁 New file uploaded: {{fileName}}

Type: {{mimeType}}
Size: {{fileSize}}
Link: {{fileUrl}}
Uploaded: {{timestamp}}
```

### Example 3: Multi-Action Workflow

**Trigger:** GitHub
**Actions:** Discord → Slack → Notion

**Notion captures final summary:**
```
Workflow Executed Successfully

Source: GitHub commit
Discord: Notified #dev-team
Slack: Posted in #deployments
Notion: This entry

Commit: {{commit_message}}
Status: ✅ Complete
```

---

## 📝 Best Practices

### 1. Database Organization

- ✅ Create separate databases for different workflows
- ✅ Use tags/categories to filter entries
- ✅ Add date properties for sorting
- ✅ Use templates in Notion for consistent formatting

### 2. Content Management

- ✅ Keep titles concise (under 2000 characters)
- ✅ Use emoji for visual categorization
- ✅ Include timestamps for tracking
- ✅ Add source identifiers

### 3. Error Handling

- ✅ Always test workflows before publishing
- ✅ Check Logs page after triggering
- ✅ Verify pages appear in Notion
- ✅ Monitor for failed executions

### 4. Security

- ✅ Keep integration tokens secret
- ✅ Don't share database IDs publicly
- ✅ Limit integration access to necessary databases only
- ✅ Rotate tokens periodically

---

## 🔍 Verification Checklist

Before going live, verify:

- [ ] Notion integration created in Notion settings
- [ ] Integration has access to target database
- [ ] Database has "Name" property (title type)
- [ ] Connection successful in Fuzzie Connections page
- [ ] Database ID saved in Fuzzie database
- [ ] Access token saved in Fuzzie database
- [ ] Test page created successfully via "Test" button
- [ ] Template saved successfully
- [ ] Workflow published
- [ ] Live trigger creates page in Notion
- [ ] Page appears in correct database
- [ ] Content is formatted correctly

---

## 📚 Additional Resources

- **Notion API Docs:** https://developers.notion.com/
- **Notion Integration Guide:** https://www.notion.so/help/create-integrations
- **Fuzzie Documentation:** Check PROJECT_REPORT.md
- **Support:** Check logs at http://localhost:3000/logs

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Connections page shows "Connected" for Notion
2. ✅ Workflow editor shows Notion node as connected
3. ✅ "Test" button creates page in your database
4. ✅ Live triggers create pages automatically
5. ✅ Logs show successful Notion executions
6. ✅ No error toasts or console errors

---

## 💡 Pro Tips

1. **Use Database Views:**
   - Create different views for different workflows
   - Filter by source, date, or status
   - Makes it easy to see what automation created

2. **Notion Formulas:**
   - Add formula properties to process data
   - Example: Extract domain from email
   - Example: Format dates nicely

3. **Notion Relations:**
   - Link workflow pages to project pages
   - Create connected workspace
   - Track automations per project

4. **Bulk Operations:**
   - Use Notion's database features
   - Bulk edit multiple automation entries
   - Export to CSV if needed

---

**Now you're ready to use Notion with Fuzzie! 🚀**

If you encounter any issues not covered here, check the console logs and the Logs page for detailed error messages.
