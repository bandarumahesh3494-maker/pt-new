# Project Tracker - API Flowcharts

## Overview

This document provides visual flowcharts for key API operations in the Project Tracker system, showing the complete request-response flow including authentication, authorization, and data processing.

---

## 1. User Authentication Flow

### Sign Up Flow

```mermaid
sequenceDiagram
    participant Client
    participant Supabase Auth
    participant PostgreSQL
    participant RLS Engine

    Client->>Supabase Auth: POST /auth/v1/signup
    Note over Client,Supabase Auth: {email, password}

    Supabase Auth->>Supabase Auth: Validate email format
    Supabase Auth->>Supabase Auth: Hash password
    Supabase Auth->>PostgreSQL: Insert into auth.users
    PostgreSQL-->>Supabase Auth: User created

    Supabase Auth->>Supabase Auth: Generate JWT token
    Supabase Auth-->>Client: Return tokens + user
    Note over Supabase Auth,Client: {access_token, refresh_token, user}

    Client->>PostgreSQL: Create profile (auto-triggered)
    Note over Client,PostgreSQL: Realm assignment happens here
```

---

### Sign In Flow

```mermaid
sequenceDiagram
    participant Client
    participant Supabase Auth
    participant PostgreSQL

    Client->>Supabase Auth: POST /auth/v1/token
    Note over Client,Supabase Auth: {email, password}

    Supabase Auth->>PostgreSQL: Query auth.users
    PostgreSQL-->>Supabase Auth: User record

    Supabase Auth->>Supabase Auth: Verify password hash

    alt Password Valid
        Supabase Auth->>Supabase Auth: Generate JWT
        Supabase Auth-->>Client: Return tokens + user
        Note over Supabase Auth,Client: {access_token, refresh_token}
    else Password Invalid
        Supabase Auth-->>Client: 401 Invalid credentials
    end
```

---

## 2. Task Creation Flow

### Create Task with Realm Isolation

```mermaid
sequenceDiagram
    participant Client
    participant PostgREST API
    participant RLS Engine
    participant get_user_realm_id()
    participant Trigger
    participant PostgreSQL
    participant Realtime Server

    Client->>PostgREST API: POST /rest/v1/tasks
    Note over Client,PostgREST API: Authorization: Bearer {JWT}<br/>{name, category, priority}

    PostgREST API->>RLS Engine: Verify JWT
    RLS Engine->>RLS Engine: Extract auth.uid()

    RLS Engine->>get_user_realm_id(): Get user's realm_id
    get_user_realm_id()->>PostgreSQL: SELECT realm_id FROM profiles
    PostgreSQL-->>get_user_realm_id(): realm_id
    get_user_realm_id()-->>RLS Engine: realm_id

    alt Realm Found
        RLS Engine->>Trigger: BEFORE INSERT trigger
        Trigger->>Trigger: Auto-populate:<br/>realm_id, user_id, created_by
        Trigger->>PostgreSQL: INSERT INTO tasks
        PostgreSQL-->>Trigger: Row inserted

        Trigger->>PostgreSQL: Log to action_history
        PostgreSQL-->>Trigger: Log created

        PostgreSQL->>Realtime Server: Notify change (WebSocket)
        Realtime Server->>Client: Broadcast INSERT event

        PostgreSQL-->>PostgREST API: Return new task
        PostgREST API-->>Client: 201 Created + task data
    else No Realm Found
        RLS Engine-->>Client: 403 Forbidden<br/>User not in any realm
    end
```

---

## 3. Data Retrieval Flow (with RLS)

### List Tasks with Realm Filtering

```mermaid
sequenceDiagram
    participant Client
    participant PostgREST API
    participant RLS Engine
    participant get_user_realm_id()
    participant PostgreSQL

    Client->>PostgREST API: GET /rest/v1/tasks
    Note over Client,PostgREST API: Authorization: Bearer {JWT}

    PostgREST API->>RLS Engine: Verify JWT
    RLS Engine->>RLS Engine: Extract auth.uid()

    RLS Engine->>get_user_realm_id(): Get user's realm_id
    get_user_realm_id()->>PostgreSQL: SELECT realm_id FROM profiles<br/>WHERE id = auth.uid()
    PostgreSQL-->>get_user_realm_id(): realm_id
    get_user_realm_id()-->>RLS Engine: realm_id

    RLS Engine->>PostgreSQL: SELECT * FROM tasks<br/>WHERE realm_id = {user_realm_id}
    Note over RLS Engine,PostgreSQL: RLS automatically filters by realm

    PostgreSQL-->>RLS Engine: Filtered results
    RLS Engine-->>PostgREST API: Tasks in user's realm only
    PostgREST API-->>Client: 200 OK + tasks array
```

---

## 4. Nested Query Flow

### Get Tasks with Full Hierarchy

```mermaid
sequenceDiagram
    participant Client
    participant PostgREST API
    participant RLS Engine
    participant PostgreSQL

    Client->>PostgREST API: GET /rest/v1/tasks?select=*,subtasks(*)
    Note over Client,PostgREST API: Complex nested query

    PostgREST API->>RLS Engine: Apply RLS on tasks
    RLS Engine->>PostgreSQL: SELECT * FROM tasks<br/>WHERE realm_id = get_user_realm_id()
    PostgreSQL-->>RLS Engine: Tasks [T1, T2, T3]

    loop For each task
        RLS Engine->>PostgreSQL: SELECT * FROM subtasks<br/>WHERE task_id = T1<br/>AND realm_id = get_user_realm_id()
        PostgreSQL-->>RLS Engine: Subtasks for T1
    end

    RLS Engine->>RLS Engine: Join and nest results
    RLS Engine-->>PostgREST API: Hierarchical data structure
    PostgREST API-->>Client: 200 OK + nested JSON
```

---

## 5. Update Operation Flow

### Update Task with Validation

```mermaid
sequenceDiagram
    participant Client
    participant PostgREST API
    participant RLS Engine
    participant PostgreSQL
    participant Realtime Server

    Client->>PostgREST API: PATCH /rest/v1/tasks?id=eq.{task_id}
    Note over Client,PostgREST API: {priority: 2, name: "Updated"}

    PostgREST API->>RLS Engine: Verify JWT & Check policy
    RLS Engine->>PostgreSQL: Check if user can update task
    Note over RLS Engine,PostgreSQL: WHERE realm_id = get_user_realm_id()<br/>AND id = {task_id}

    alt Task Exists in User's Realm
        PostgreSQL->>PostgreSQL: UPDATE tasks SET...<br/>WHERE id = {task_id}
        PostgreSQL-->>RLS Engine: 1 row updated

        PostgreSQL->>PostgreSQL: Log to action_history
        PostgreSQL->>Realtime Server: Notify UPDATE event
        Realtime Server->>Client: Broadcast change

        RLS Engine-->>PostgREST API: Updated task
        PostgREST API-->>Client: 200 OK + updated data
    else Task Not Found or Wrong Realm
        RLS Engine-->>PostgREST API: No rows affected
        PostgREST API-->>Client: 404 Not Found
    end
```

---

## 6. Delete Operation with Cascade

### Delete Task (Cascade to Subtasks)

```mermaid
sequenceDiagram
    participant Client
    participant PostgREST API
    participant RLS Engine
    participant PostgreSQL
    participant Realtime Server

    Client->>PostgREST API: DELETE /rest/v1/tasks?id=eq.{task_id}

    PostgREST API->>RLS Engine: Verify JWT & permissions
    RLS Engine->>PostgreSQL: Check task ownership

    alt User Can Delete
        PostgreSQL->>PostgreSQL: DELETE FROM tasks<br/>WHERE id = {task_id}
        Note over PostgreSQL: CASCADE triggers:
        PostgreSQL->>PostgreSQL: DELETE FROM subtasks<br/>WHERE task_id = {task_id}
        PostgreSQL->>PostgreSQL: DELETE FROM sub_subtasks<br/>WHERE subtask_id IN (...)

        PostgreSQL->>PostgreSQL: Log deletion to action_history

        PostgreSQL->>Realtime Server: Notify DELETE event
        Realtime Server->>Client: Broadcast deletion

        PostgreSQL-->>RLS Engine: Rows deleted
        RLS Engine-->>PostgREST API: Success
        PostgREST API-->>Client: 204 No Content
    else User Cannot Delete
        RLS Engine-->>Client: 403 Forbidden
    end
```

---

## 7. Real-time Subscription Flow

### WebSocket Real-time Updates

```mermaid
sequenceDiagram
    participant Client A
    participant Client B
    participant Realtime Server
    participant PostgreSQL
    participant PostgREST API

    Client A->>Realtime Server: Connect WebSocket
    Realtime Server-->>Client A: Connection established

    Client A->>Realtime Server: Subscribe to 'tasks' table changes
    Note over Client A,Realtime Server: channel.on('postgres_changes')
    Realtime Server-->>Client A: Subscription confirmed

    Client B->>Realtime Server: Connect & Subscribe
    Realtime Server-->>Client B: Subscription confirmed

    Client A->>PostgREST API: POST /rest/v1/tasks (Create)
    PostgREST API->>PostgreSQL: INSERT INTO tasks
    PostgreSQL-->>PostgREST API: Task created

    PostgreSQL->>Realtime Server: NOTIFY task_insert

    par Broadcast to all subscribers
        Realtime Server->>Client A: Task INSERT event
        Realtime Server->>Client B: Task INSERT event
    end

    Note over Client A,Client B: Both clients see update instantly

    Client A->>Client A: Refetch tasks
    Client B->>Client B: Refetch tasks
```

---

## 8. Milestone Creation Flow

### Create Milestone with Constraints

```mermaid
sequenceDiagram
    participant Client
    participant PostgREST API
    participant RLS Engine
    participant PostgreSQL

    Client->>PostgREST API: POST /rest/v1/milestones
    Note over Client,PostgREST API: {subtask_id: X,<br/>milestone_date: "2024-02-01",<br/>milestone_text: "Complete"}

    PostgREST API->>RLS Engine: Verify JWT
    RLS Engine->>PostgreSQL: Check constraints

    PostgreSQL->>PostgreSQL: Validate CHECK constraint
    Note over PostgreSQL: Either subtask_id OR sub_subtask_id<br/>(not both, not neither)

    alt Constraint Valid
        PostgreSQL->>PostgreSQL: INSERT milestone
        PostgreSQL->>PostgreSQL: Auto-populate realm_id
        PostgreSQL-->>RLS Engine: Milestone created
        RLS Engine-->>PostgREST API: Success
        PostgREST API-->>Client: 201 Created
    else Constraint Violated
        PostgreSQL-->>RLS Engine: Constraint error
        RLS Engine-->>PostgREST API: Validation failed
        PostgREST API-->>Client: 400 Bad Request<br/>"violates check constraint"
    end
```

---

## 9. Configuration Update Flow

### Upsert Configuration

```mermaid
sequenceDiagram
    participant Client
    participant PostgREST API
    participant PostgreSQL

    Client->>PostgREST API: POST /rest/v1/config
    Note over Client,PostgREST API: Prefer: resolution=merge-duplicates<br/>{key: "theme", value: {...}}

    PostgREST API->>PostgreSQL: Check for existing config
    Note over PostgreSQL: SELECT * FROM config<br/>WHERE key = "theme"<br/>AND realm_id = get_user_realm_id()

    alt Config Exists
        PostgreSQL->>PostgreSQL: UPDATE config<br/>SET value = {...}
        PostgreSQL-->>PostgREST API: Config updated
    else Config Doesn't Exist
        PostgreSQL->>PostgreSQL: INSERT INTO config<br/>(key, value)
        PostgreSQL-->>PostgREST API: Config created
    end

    PostgREST API-->>Client: 200 OK + config data
```

---

## 10. Action History Logging Flow

### Automatic Audit Trail

```mermaid
sequenceDiagram
    participant Client
    participant PostgREST API
    participant PostgreSQL Tasks
    participant PostgreSQL History
    participant Application Logger

    Client->>PostgREST API: POST /rest/v1/tasks
    Note over Client,PostgREST API: Create new task

    PostgREST API->>PostgreSQL Tasks: INSERT INTO tasks
    PostgreSQL Tasks-->>PostgREST API: Task created (ID: 123)

    PostgREST API->>Application Logger: Log action
    Application Logger->>PostgreSQL History: INSERT INTO action_history
    Note over Application Logger,PostgreSQL History: {<br/>  action_type: "create",<br/>  entity_type: "task",<br/>  entity_id: "123",<br/>  details: {...}<br/>}

    PostgreSQL History-->>Application Logger: Log saved
    Application Logger-->>PostgREST API: Logged successfully

    PostgREST API-->>Client: 201 Created + task data

    Note over PostgreSQL History: Audit trail preserved<br/>for compliance
```

---

## 11. Multi-Tenant Isolation Enforcement

### Realm Boundary Protection

```mermaid
flowchart TD
    A[Client Request] --> B{JWT Valid?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D[Extract auth.uid]

    D --> E[Call get_user_realm_id]
    E --> F{User has realm?}

    F -->|No| G[403 User not in realm]
    F -->|Yes| H[Get realm_id]

    H --> I[Apply RLS Policy]
    I --> J[Filter by realm_id = user_realm_id]

    J --> K{Data in user's realm?}
    K -->|Yes| L[Return filtered data]
    K -->|No| M[Return empty set]

    L --> N[200 OK + Data]
    M --> N

    style H fill:#90EE90
    style I fill:#FFD700
    style J fill:#FFD700
```

---

## 12. Error Handling Flow

### Common Error Scenarios

```mermaid
flowchart TD
    A[Client Request] --> B{Has API Key?}
    B -->|No| C[400 Missing apikey]
    B -->|Yes| D{Valid JWT?}

    D -->|No| E[401 Unauthorized]
    D -->|Expired| F[401 Token expired]
    D -->|Yes| G{User in realm?}

    G -->|No| H[403 No realm access]
    G -->|Yes| I{RLS Policy Pass?}

    I -->|No| J[403 RLS violation]
    I -->|Yes| K{Valid Input?}

    K -->|Invalid UUID| L[400 Invalid syntax]
    K -->|Missing Field| M[400 Missing required field]
    K -->|Constraint Error| N[409 Constraint violation]
    K -->|Valid| O[Process Request]

    O --> P{Success?}
    P -->|Yes| Q[200/201 Success]
    P -->|No| R[500 Server Error]

    style C fill:#FF6B6B
    style E fill:#FF6B6B
    style F fill:#FF6B6B
    style H fill:#FF6B6B
    style J fill:#FF6B6B
    style L fill:#FF8C42
    style M fill:#FF8C42
    style N fill:#FF8C42
    style Q fill:#90EE90
```

---

## 13. Full Task Hierarchy Query

### Complex Nested Data Retrieval

```mermaid
flowchart LR
    A[Client] -->|1. Request| B[PostgREST API]
    B -->|2. Query| C[Tasks Table]
    C -->|3. Task IDs| D[Subtasks Table]
    D -->|4. Subtask IDs| E[Sub-Subtasks Table]
    D -->|5. Subtask IDs| F[Milestones Table]
    E -->|6. Sub-Subtask IDs| F

    F -->|7. Milestone Data| D
    E -->|8. Sub-Subtask + Milestones| D
    D -->|9. Subtask + Children| C
    C -->|10. Task + Full Tree| B
    B -->|11. Nested JSON| A

    style A fill:#4A90E2
    style B fill:#50E3C2
    style C fill:#F5A623
    style D fill:#F5A623
    style E fill:#F5A623
    style F fill:#F5A623
```

---

## 14. Batch Operations Flow

### Multiple Subtasks Creation

```mermaid
sequenceDiagram
    participant Client
    participant PostgREST API
    participant PostgreSQL
    participant Realtime

    Client->>PostgREST API: POST /rest/v1/subtasks (Array)
    Note over Client,PostgREST API: [{task_id: X, name: "A"},<br/>{task_id: X, name: "B"},<br/>{task_id: X, name: "C"}]

    loop For each subtask
        PostgREST API->>PostgreSQL: INSERT subtask
        PostgreSQL->>PostgreSQL: Apply RLS & triggers
        PostgreSQL-->>PostgREST API: Subtask created
        PostgreSQL->>Realtime: Notify INSERT
    end

    PostgREST API-->>Client: 201 Created + Array of subtasks

    Note over Realtime: Multiple INSERT events<br/>broadcasted to subscribers
```

---

## 15. Access Control Decision Flow

### RBAC Policy Evaluation

```mermaid
flowchart TD
    A[User Action Request] --> B{Authenticated?}
    B -->|No| C[Deny - Login Required]
    B -->|Yes| D[Get User Role]

    D --> E{Action Type?}

    E -->|Read| F{Data in user's realm?}
    F -->|Yes| G[Allow]
    F -->|No| H[Deny]

    E -->|Create| I{User role?}
    I -->|Owner/Admin/User| J[Allow]
    I -->|Other| K[Deny]

    E -->|Update| L{Created by user OR Admin?}
    L -->|Yes| M[Allow]
    L -->|No| N[Deny]

    E -->|Delete| O{Is Owner/Admin?}
    O -->|Yes| P[Allow]
    O -->|No| Q{Created by user?}
    Q -->|Yes| P
    Q -->|No| R[Deny]

    style G fill:#90EE90
    style J fill:#90EE90
    style M fill:#90EE90
    style P fill:#90EE90
    style C fill:#FF6B6B
    style H fill:#FF6B6B
    style K fill:#FF6B6B
    style N fill:#FF6B6B
    style R fill:#FF6B6B
```

---

## Summary

These flowcharts illustrate:

1. **Authentication**: JWT-based auth with token management
2. **Authorization**: Multi-tenant realm isolation via RLS
3. **Data Operations**: CRUD with automatic realm filtering
4. **Real-time**: WebSocket subscriptions for live updates
5. **Error Handling**: Comprehensive error scenarios
6. **Complex Queries**: Nested data retrieval patterns
7. **Audit Logging**: Automatic action history tracking
8. **Access Control**: Role-based permission evaluation

All operations maintain strict realm isolation, ensuring complete data security in a multi-tenant environment.
