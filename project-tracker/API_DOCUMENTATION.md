# Project Tracker - API Documentation

## Overview

The Project Tracker uses Supabase's auto-generated REST API (PostgREST) for all database operations. All API requests require authentication and are automatically filtered by realm isolation through Row-Level Security (RLS).

**Base URL**: `https://[YOUR_PROJECT].supabase.co/rest/v1`

**Authentication**: All requests require a JWT token in the Authorization header.

---

## Authentication

### Sign Up

Create a new user account.

```bash
curl -X POST 'https://[YOUR_PROJECT].supabase.co/auth/v1/signup' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "created_at": "2024-01-20T10:00:00Z"
  }
}
```

---

### Sign In

Authenticate an existing user.

```bash
curl -X POST 'https://[YOUR_PROJECT].supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Response:** Same as Sign Up

---

### Get Current User

Retrieve the currently authenticated user.

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/auth/v1/user' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2024-01-20T10:00:00Z"
}
```

---

### Sign Out

End the current session.

```bash
curl -X POST 'https://[YOUR_PROJECT].supabase.co/auth/v1/logout' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

## Realms API

### Get Current User's Realm

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/profiles?select=realm_id,realms(name)&id=eq.[USER_ID]' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

**Response:**
```json
[
  {
    "realm_id": "123e4567-e89b-12d3-a456-426614174000",
    "realms": {
      "name": "Acme Corporation"
    }
  }
]
```

---

### List All Realms (Admin Only)

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/realms' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

**Response:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Acme Corporation",
    "created_at": "2024-01-15T08:00:00Z",
    "updated_at": "2024-01-15T08:00:00Z"
  }
]
```

---

### Create a New Realm

```bash
curl -X POST 'https://[YOUR_PROJECT].supabase.co/rest/v1/realms' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "New Organization"
  }'
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "New Organization",
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-20T10:00:00Z"
}
```

---

## Profiles API

### Get All Profiles in Realm

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/profiles' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "admin",
    "realm_id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2024-01-10T12:00:00Z",
    "updated_at": "2024-01-20T09:00:00Z"
  },
  {
    "id": "660f9511-f3ac-52e5-b827-557766551111",
    "email": "jane@example.com",
    "full_name": "Jane Smith",
    "role": "user",
    "realm_id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2024-01-12T14:00:00Z",
    "updated_at": "2024-01-15T16:00:00Z"
  }
]
```

---

### Update User Profile

```bash
curl -X PATCH 'https://[YOUR_PROJECT].supabase.co/rest/v1/profiles?id=eq.550e8400-e29b-41d4-a716-446655440000' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "full_name": "John Updated Doe"
  }'
```

---

## Tasks API

### Create a Task

```bash
curl -X POST 'https://[YOUR_PROJECT].supabase.co/rest/v1/tasks' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Build User Authentication",
    "category": "dev",
    "priority": 1
  }'
```

**Note**: `realm_id`, `user_id`, and `created_by` are auto-populated by database trigger.

**Response:**
```json
{
  "id": "789e1234-e89b-12d3-a456-426614174999",
  "realm_id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Build User Authentication",
  "category": "dev",
  "priority": 1,
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-20T10:00:00Z"
}
```

---

### List All Tasks

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/tasks?order=category.asc' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

**Response:**
```json
[
  {
    "id": "789e1234-e89b-12d3-a456-426614174999",
    "realm_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_by": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Build User Authentication",
    "category": "dev",
    "priority": 1,
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T10:00:00Z"
  }
]
```

---

### Get a Single Task

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/tasks?id=eq.789e1234-e89b-12d3-a456-426614174999' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

### Update a Task

```bash
curl -X PATCH 'https://[YOUR_PROJECT].supabase.co/rest/v1/tasks?id=eq.789e1234-e89b-12d3-a456-426614174999' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "priority": 2,
    "name": "Build User Authentication (Updated)"
  }'
```

---

### Delete a Task

```bash
curl -X DELETE 'https://[YOUR_PROJECT].supabase.co/rest/v1/tasks?id=eq.789e1234-e89b-12d3-a456-426614174999' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

### Filter Tasks by Category

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/tasks?category=eq.dev' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

### Filter Tasks by Priority

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/tasks?priority=eq.1' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

## Subtasks API

### Create a Subtask

```bash
curl -X POST 'https://[YOUR_PROJECT].supabase.co/rest/v1/subtasks' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "task_id": "789e1234-e89b-12d3-a456-426614174999",
    "name": "Design Login Form",
    "assigned_to": "660f9511-f3ac-52e5-b827-557766551111"
  }'
```

**Response:**
```json
{
  "id": "888e5678-e89b-12d3-a456-426614174888",
  "realm_id": "123e4567-e89b-12d3-a456-426614174000",
  "task_id": "789e1234-e89b-12d3-a456-426614174999",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Design Login Form",
  "assigned_to": "660f9511-f3ac-52e5-b827-557766551111",
  "created_at": "2024-01-20T10:05:00Z",
  "updated_at": "2024-01-20T10:05:00Z"
}
```

---

### List Subtasks for a Task

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/subtasks?task_id=eq.789e1234-e89b-12d3-a456-426614174999' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

### Update Subtask Assignment

```bash
curl -X PATCH 'https://[YOUR_PROJECT].supabase.co/rest/v1/subtasks?id=eq.888e5678-e89b-12d3-a456-426614174888' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "assigned_to": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

---

### Delete a Subtask

```bash
curl -X DELETE 'https://[YOUR_PROJECT].supabase.co/rest/v1/subtasks?id=eq.888e5678-e89b-12d3-a456-426614174888' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

## Sub-Subtasks API

### Create a Sub-Subtask

```bash
curl -X POST 'https://[YOUR_PROJECT].supabase.co/rest/v1/sub_subtasks' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "subtask_id": "888e5678-e89b-12d3-a456-426614174888",
    "name": "Create email input field",
    "order_index": 1,
    "assigned_to": "660f9511-f3ac-52e5-b827-557766551111"
  }'
```

**Response:**
```json
{
  "id": "999e6789-e89b-12d3-a456-426614174777",
  "realm_id": "123e4567-e89b-12d3-a456-426614174000",
  "subtask_id": "888e5678-e89b-12d3-a456-426614174888",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Create email input field",
  "order_index": 1,
  "assigned_to": "660f9511-f3ac-52e5-b827-557766551111",
  "created_at": "2024-01-20T10:10:00Z"
}
```

---

### List Sub-Subtasks for a Subtask

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/sub_subtasks?subtask_id=eq.888e5678-e89b-12d3-a456-426614174888&order=order_index.asc' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

### Update Sub-Subtask Order

```bash
curl -X PATCH 'https://[YOUR_PROJECT].supabase.co/rest/v1/sub_subtasks?id=eq.999e6789-e89b-12d3-a456-426614174777' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "order_index": 2
  }'
```

---

## Milestones API

### Create a Milestone (for Subtask)

```bash
curl -X POST 'https://[YOUR_PROJECT].supabase.co/rest/v1/milestones' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "subtask_id": "888e5678-e89b-12d3-a456-426614174888",
    "milestone_date": "2024-02-01",
    "milestone_text": "Design Complete"
  }'
```

**Response:**
```json
{
  "id": "aaa1234-e89b-12d3-a456-426614174666",
  "realm_id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "subtask_id": "888e5678-e89b-12d3-a456-426614174888",
  "sub_subtask_id": null,
  "milestone_date": "2024-02-01",
  "milestone_text": "Design Complete",
  "created_at": "2024-01-20T10:15:00Z",
  "updated_at": "2024-01-20T10:15:00Z"
}
```

---

### Create a Milestone (for Sub-Subtask)

```bash
curl -X POST 'https://[YOUR_PROJECT].supabase.co/rest/v1/milestones' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "sub_subtask_id": "999e6789-e89b-12d3-a456-426614174777",
    "milestone_date": "2024-01-25",
    "milestone_text": "Email field ready"
  }'
```

---

### List All Milestones in Date Range

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/milestones?milestone_date=gte.2024-01-01&milestone_date=lte.2024-12-31&order=milestone_date.asc' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

### Update a Milestone

```bash
curl -X PATCH 'https://[YOUR_PROJECT].supabase.co/rest/v1/milestones?id=eq.aaa1234-e89b-12d3-a456-426614174666' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "milestone_date": "2024-02-05",
    "milestone_text": "Design Complete (Revised)"
  }'
```

---

### Delete a Milestone

```bash
curl -X DELETE 'https://[YOUR_PROJECT].supabase.co/rest/v1/milestones?id=eq.aaa1234-e89b-12d3-a456-426614174666' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

## Config API

### Get Configuration

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/config?key=eq.theme' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

**Response:**
```json
[
  {
    "id": "bbb2345-e89b-12d3-a456-426614174555",
    "realm_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "key": "theme",
    "value": {
      "selected": "dark",
      "customColors": {}
    },
    "created_at": "2024-01-15T08:00:00Z",
    "updated_at": "2024-01-20T09:00:00Z"
  }
]
```

---

### Set Configuration

```bash
curl -X POST 'https://[YOUR_PROJECT].supabase.co/rest/v1/config' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation,resolution=merge-duplicates" \
  -d '{
    "key": "theme",
    "value": {
      "selected": "blue",
      "customColors": {}
    }
  }'
```

**Note**: Use `resolution=merge-duplicates` to upsert (update if exists, insert if not).

---

## Action History API

### List Recent Actions

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/action_history?order=created_at.desc&limit=50' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

**Response:**
```json
[
  {
    "id": "ccc3456-e89b-12d3-a456-426614174444",
    "realm_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "action_type": "create",
    "entity_type": "task",
    "entity_id": "789e1234-e89b-12d3-a456-426614174999",
    "details": {
      "name": "Build User Authentication",
      "category": "dev",
      "priority": 1
    },
    "created_at": "2024-01-20T10:00:00Z"
  }
]
```

---

### Filter Actions by User

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/action_history?user_id=eq.550e8400-e29b-41d4-a716-446655440000&order=created_at.desc' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

### Filter Actions by Entity

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/action_history?entity_type=eq.task&entity_id=eq.789e1234-e89b-12d3-a456-426614174999' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

## Temporary Tasks API

### Create Temp Task

```bash
curl -X POST 'https://[YOUR_PROJECT].supabase.co/rest/v1/temp_tasks' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Quick Fix for Bug #123",
    "priority": "High",
    "status": "draft",
    "created_byname": "John Doe"
  }'
```

**Response:**
```json
{
  "id": "ddd4567-e89b-12d3-a456-426614174333",
  "realm_id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Quick Fix for Bug #123",
  "priority": "High",
  "status": "draft",
  "assigned_byname": null,
  "created_byname": "John Doe",
  "created_at": "2024-01-20T10:20:00Z",
  "updated_at": "2024-01-20T10:20:00Z"
}
```

---

### List Temp Tasks

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/temp_tasks?order=created_at.desc' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

### Update Temp Task Status

```bash
curl -X PATCH 'https://[YOUR_PROJECT].supabase.co/rest/v1/temp_tasks?id=eq.ddd4567-e89b-12d3-a456-426614174333' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "status": "approved"
  }'
```

---

## Advanced Queries

### Get Tasks with Subtasks (Nested)

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/tasks?select=*,subtasks(*)' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

### Get Tasks with Full Hierarchy

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/tasks?select=*,subtasks(*,sub_subtasks(*,milestones(*)),milestones(*))' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

### Get Subtasks with Assigned User

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/subtasks?select=*,profiles!assigned_to(email,full_name)' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

---

## Error Responses

### 401 Unauthorized

```json
{
  "message": "Invalid JWT token"
}
```

### 403 Forbidden

```json
{
  "message": "new row violates row-level security policy"
}
```

### 400 Bad Request

```json
{
  "message": "invalid input syntax for type uuid: \"invalid-id\""
}
```

### 409 Conflict

```json
{
  "message": "duplicate key value violates unique constraint"
}
```

---

## Request Headers

### Required Headers

| Header | Description | Example |
|--------|-------------|---------|
| `apikey` | Supabase anonymous key | `eyJhbGc...` |
| `Authorization` | Bearer token from auth | `Bearer eyJhbG...` |
| `Content-Type` | Request content type | `application/json` |

### Optional Headers

| Header | Description | Example |
|--------|-------------|---------|
| `Prefer` | PostgREST preferences | `return=representation` |

### Prefer Header Options

- `return=representation`: Return the created/updated record
- `return=minimal`: Return no content (faster)
- `resolution=merge-duplicates`: Upsert behavior
- `count=exact`: Return total count of records

---

## Rate Limiting

Supabase applies rate limiting based on your plan:
- **Free Tier**: 500 requests per minute
- **Pro Tier**: 1000 requests per minute
- **Enterprise**: Custom limits

---

## Pagination

Use `limit` and `offset` for pagination:

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/tasks?limit=10&offset=0' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

Get total count:

```bash
curl -X GET 'https://[YOUR_PROJECT].supabase.co/rest/v1/tasks?limit=10&offset=0' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -H "Prefer: count=exact"
```

Response includes `Content-Range` header:
```
Content-Range: 0-9/156
```

---

## WebSocket Real-time Subscriptions

Subscribe to database changes using Supabase Realtime:

```javascript
const channel = supabase.channel('tracker_changes');

channel
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks'
  }, (payload) => {
    console.log('Task changed:', payload);
  })
  .subscribe();
```

**Events:**
- `INSERT`: New record created
- `UPDATE`: Record modified
- `DELETE`: Record deleted
- `*`: All events
