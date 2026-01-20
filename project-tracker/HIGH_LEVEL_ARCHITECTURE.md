# Project Tracker - High Level Architecture

## System Architecture Overview

This document provides a high-level view of the Project Tracker system architecture, including component relationships, data flow, and deployment structure.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                     React Application                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │    │
│  │  │  Dashboard   │  │   Calendar   │  │    Kanban    │    │    │
│  │  │    Views     │  │     View     │  │     Board    │    │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │    │
│  │  │   Gantt      │  │    Task      │  │  Performance │    │    │
│  │  │    Chart     │  │     List     │  │  Analytics   │    │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │    │
│  │                                                            │    │
│  │  ┌─────────────────────────────────────────────────────┐  │    │
│  │  │           Component Layer (TypeScript)              │  │    │
│  │  │  • Task Management Components                       │  │    │
│  │  │  • Modal Components (Add/Edit)                      │  │    │
│  │  │  • Filter Components                                │  │    │
│  │  │  • Auth Components                                  │  │    │
│  │  └─────────────────────────────────────────────────────┘  │    │
│  │                                                            │    │
│  │  ┌─────────────────────────────────────────────────────┐  │    │
│  │  │         State Management Layer                      │  │    │
│  │  │  ┌──────────────┐  ┌──────────────┐                │  │    │
│  │  │  │ AuthContext  │  │ ThemeContext │                │  │    │
│  │  │  └──────────────┘  └──────────────┘                │  │    │
│  │  │  ┌──────────────────────────────────┐              │  │    │
│  │  │  │   Custom Hooks (useTrackerData)   │              │  │    │
│  │  │  └──────────────────────────────────┘              │  │    │
│  │  └─────────────────────────────────────────────────────┘  │    │
│  │                                                            │    │
│  │  ┌─────────────────────────────────────────────────────┐  │    │
│  │  │            Supabase Client SDK                      │  │    │
│  │  │  • Authentication                                   │  │    │
│  │  │  • Real-time Subscriptions                          │  │    │
│  │  │  • Database Queries                                 │  │    │
│  │  └─────────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS / WebSocket
┌─────────────────────────────────────────────────────────────────────┐
│                        SUPABASE BACKEND                              │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    API Gateway Layer                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │    │
│  │  │     Auth     │  │   REST API   │  │  Realtime    │    │    │
│  │  │     API      │  │   (PostgREST)│  │  (WebSocket) │    │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              ↕                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              PostgreSQL Database Layer                      │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │          Row-Level Security (RLS) Engine             │   │    │
│  │  │  • Realm-based isolation                             │   │    │
│  │  │  • Role-based access policies                        │   │    │
│  │  │  • Automatic security enforcement                    │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  │                                                             │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │                 Database Tables                      │   │    │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │    │
│  │  │  │  realms  │  │ profiles │  │  tasks   │          │   │    │
│  │  │  └──────────┘  └──────────┘  └──────────┘          │   │    │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │    │
│  │  │  │ subtasks │  │ sub_sub  │  │milestones│          │   │    │
│  │  │  │          │  │  tasks   │  │          │          │   │    │
│  │  │  └──────────┘  └──────────┘  └──────────┘          │   │    │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │    │
│  │  │  │  config  │  │ action_  │  │temp_tasks│          │   │    │
│  │  │  │          │  │ history  │  │          │          │   │    │
│  │  │  └──────────┘  └──────────┘  └──────────┘          │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  │                                                             │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │          Database Functions & Triggers               │   │    │
│  │  │  • get_user_realm_id()                               │   │    │
│  │  │  • auto_populate_realm_and_user()                    │   │    │
│  │  │  • Automatic realm assignment triggers               │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

```
src/
├── components/
│   ├── Dashboard.tsx                    # Main timeline view
│   ├── CalendarDashboard.tsx            # Calendar view
│   ├── KanbanDashboard.tsx             # Kanban board
│   ├── GanttChartDashboard.tsx         # Gantt chart
│   ├── TaskListDashboard.tsx           # Task list view
│   ├── EngineerBreakdownDashboard.tsx  # Engineer analytics
│   ├── EngineerPerformanceDashboard.tsx # Performance metrics
│   ├── TaskDelayDashboard.tsx          # Delay tracking
│   ├── ResourceAnalysisDashboard.tsx   # Resource analysis
│   ├── HistoryDashboard.tsx            # Audit log
│   ├── ConfigDashboard.tsx             # Configuration
│   ├── AddTaskModal.tsx                # Task creation
│   ├── AddSubtaskModal.tsx             # Subtask creation
│   ├── AddSubSubtaskModal.tsx          # Sub-subtask creation
│   ├── EditTaskModal.tsx               # Task editing
│   ├── EditSubtaskModal.tsx            # Subtask editing
│   ├── EditSubSubtaskModal.tsx         # Sub-subtask editing
│   ├── MilestoneModal.tsx              # Milestone management
│   ├── DeleteConfirmModal.tsx          # Deletion confirmation
│   ├── PeopleFilter.tsx                # People filtering
│   ├── TimeRangeSelector.tsx           # Date range selection
│   ├── ThemeSelector.tsx               # Theme switcher
│   └── AuthForm.tsx                    # Authentication
│
├── contexts/
│   ├── AuthContext.tsx                 # Authentication state
│   └── ThemeContext.tsx                # Theme state
│
├── hooks/
│   ├── useTrackerData.ts               # Data fetching hook
│   └── useConfig.ts                    # Config management
│
├── lib/
│   ├── supabase.ts                     # Supabase client
│   └── actionLogger.ts                 # Audit logging
│
└── types/
    └── index.ts                        # TypeScript types
```

---

## Data Flow Architecture

### Read Operations

```
User Action (View Dashboard)
    ↓
React Component Mount
    ↓
useTrackerData Hook
    ↓
Supabase Client Query
    ↓
PostgreSQL (RLS Check)
    ↓
Filter by realm_id = get_user_realm_id()
    ↓
Return filtered data
    ↓
Update React State
    ↓
Re-render UI
```

### Write Operations

```
User Action (Create/Update Task)
    ↓
Component Handler
    ↓
Supabase Client Mutation
    ↓
PostgreSQL RLS Check
    ↓
Trigger: auto_populate_realm_and_user()
    ↓
Insert/Update Record
    ↓
Log to action_history table
    ↓
Real-time Broadcast (WebSocket)
    ↓
All Connected Clients
    ↓
useTrackerData Hook Refetch
    ↓
Update UI
```

---

## Security Architecture

### Multi-Tenant Isolation

```
┌─────────────────────────────────────────────┐
│            User Authentication               │
│         (Supabase Auth - JWT)                │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│         Extract User ID (auth.uid())         │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│     Lookup User Profile → Get realm_id       │
│        get_user_realm_id() function          │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│        Row-Level Security Policies           │
│   Filter ALL queries by realm_id             │
│   WHERE realm_id = get_user_realm_id()       │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│     Return only realm-specific data          │
│     Complete data isolation achieved         │
└─────────────────────────────────────────────┘
```

---

## Real-time Architecture

### WebSocket Connection Flow

```
Client Initialization
    ↓
Establish WebSocket Connection
    ↓
Subscribe to Database Changes
    ↓
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tasks'
    })
    ↓
Database Change Occurs
    ↓
PostgreSQL Notify
    ↓
Supabase Realtime Server
    ↓
Broadcast to Subscribed Clients
    ↓
Client Receives Update
    ↓
Trigger Data Refetch
    ↓
UI Auto-updates
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│              Production Environment          │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │      CDN (Static Assets)           │     │
│  │  • HTML, CSS, JS bundles           │     │
│  │  • Images, fonts                   │     │
│  │  • Cached globally                 │     │
│  └────────────┬───────────────────────┘     │
│               ↓                              │
│  ┌────────────────────────────────────┐     │
│  │    Web Server (Nginx/Vite)         │     │
│  │  • Serve React SPA                 │     │
│  │  • Route handling                  │     │
│  │  • SSL/TLS termination             │     │
│  └────────────┬───────────────────────┘     │
│               ↓                              │
│  ┌────────────────────────────────────┐     │
│  │      Supabase Cloud Platform       │     │
│  │  ┌──────────────────────────────┐  │     │
│  │  │   Auth Service               │  │     │
│  │  └──────────────────────────────┘  │     │
│  │  ┌──────────────────────────────┐  │     │
│  │  │   PostgreSQL Database        │  │     │
│  │  │   (Managed, Auto-scaling)    │  │     │
│  │  └──────────────────────────────┘  │     │
│  │  ┌──────────────────────────────┐  │     │
│  │  │   Realtime Server            │  │     │
│  │  └──────────────────────────────┘  │     │
│  │  ┌──────────────────────────────┐  │     │
│  │  │   Storage Service            │  │     │
│  │  └──────────────────────────────┘  │     │
│  └────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Stack
- **Framework**: React 18+
- **Language**: TypeScript
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Icons**: Lucide React

### Backend Stack
- **Database**: PostgreSQL 15+
- **BaaS**: Supabase
- **Authentication**: Supabase Auth (JWT)
- **Real-time**: Supabase Realtime (WebSocket)
- **API**: PostgREST (Auto-generated REST API)

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Type Checking**: TypeScript Compiler

---

## Scalability Considerations

### Horizontal Scaling
- **Stateless Frontend**: Can be deployed across multiple servers
- **CDN Distribution**: Static assets served from edge locations
- **Database Scaling**: Supabase auto-scaling for read replicas

### Performance Optimizations
- **Code Splitting**: Dynamic imports for route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Database Indexes**: Optimized queries with proper indexing
- **Connection Pooling**: Efficient database connection management

### Caching Strategy
- **Browser Cache**: Static assets cached with versioning
- **React State**: Local state caching with Context API
- **Query Results**: Temporary caching in hooks
- **Real-time Updates**: Optimistic UI updates

---

## Monitoring & Observability

### Logging
- **Action History**: All user actions logged to database
- **Error Tracking**: Console error logging
- **Audit Trail**: Complete change history

### Metrics
- **Database Metrics**: Supabase dashboard
- **Application Metrics**: Performance monitoring
- **User Analytics**: Usage tracking

---

## Disaster Recovery

### Backup Strategy
- **Automatic Backups**: Daily Supabase backups
- **Point-in-Time Recovery**: PostgreSQL PITR
- **Backup Retention**: 30-day retention policy

### High Availability
- **Database Replication**: Multi-region replication (Supabase Pro)
- **Automatic Failover**: Built-in failover mechanisms
- **99.9% Uptime SLA**: Supabase cloud guarantee
