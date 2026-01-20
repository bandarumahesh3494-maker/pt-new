import { useEffect, useState, useRef } from 'react';
import { supabase } from './lib/supabase';

import { Dashboard } from './components/Dashboard';
import { CalendarDashboard } from './components/CalendarDashboard';
import { EngineerBreakdownDashboard } from './components/EngineerBreakdownDashboard';
import { KanbanDashboard } from './components/KanbanDashboard';
import { EngineerPerformanceDashboard } from './components/EngineerPerformanceDashboard';
import { TaskDelayDashboard } from './components/TaskDelayDashboard';
import { GanttChartDashboard } from './components/GanttChartDashboard';
import { TaskListDashboard } from './components/TaskListDashboard';
import { ConfigDashboard } from './components/ConfigDashboard';
import { HistoryDashboard } from './components/HistoryDashboard';
import { ResourceAnalysisDashboard } from './components/ResourceAnalysisDashboard';
import { TempTasksDashboard } from './components/Temp-tasks/TempTaskDashboard';
import { Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

import {
  LayoutGrid,
  CalendarDays,
  Users,
  Kanban,
  TrendingDown,
  AlertCircle,
  Settings,
  BarChart3,
  List,
  History,
  UserCheck,
  LogOut,
} from 'lucide-react';

import {
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
} from 'react-router-dom';

/* ================= SETTINGS MENU ================= */

function SettingsMenu({
  userProfile,
  currentRealm,
  isRealmAdmin,
}: {
  userProfile: any;
  currentRealm: any;
  isRealmAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin', { replace: true });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg bg-slate-800 text-gray-300 hover:bg-slate-700"
      >
        <Settings className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg bg-slate-800 border border-slate-700 shadow-lg z-50">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm font-medium text-white truncate">
              {userProfile.email}
            </p>
            <p className="text-xs text-slate-400">
              Role: {isRealmAdmin ? 'Realm Admin' : 'User'}
            </p>
            <p className="text-xs text-blue-400 truncate">
              Realm: {currentRealm?.name}
            </p>
          </div>

          <button
            onClick={() => {
              navigate('/config');
              setOpen(false);
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            <Settings size={16} />
            Configuration
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= MAIN APP ================= */

function App() {
  const { colors } = useTheme();
  const { userProfile, currentRealm } = useAuth();

  const isRealmAdmin =
    userProfile?.role === 'realm_admin' ||
    userProfile?.role === 'owner' ||
    userProfile?.role === 'admin';

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      {/* HEADER */}
      <div className={`${colors.headerBg} border-b ${colors.border} px-6 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <NavBtn to="/timeline" icon={LayoutGrid} label="Timeline" />
            <NavBtn to="/calendar" icon={CalendarDays} label="Calendar" />
            <NavBtn to="/engineer" icon={Users} label="Users Breakdown" />
            <NavBtn to="/kanban" icon={Kanban} label="Kanban Board" />
            <NavBtn to="/gantt" icon={BarChart3} label="Gantt" />
            <NavBtn to="/tasks" icon={List} label="Tasks" />
            <NavBtn to="/performance" icon={TrendingDown} label="Performance" />
            <NavBtn to="/delays" icon={AlertCircle} label="Delays" />
            <NavBtn to="/history" icon={History} label="History" />
            <NavBtn to="/resources" icon={UserCheck} label="Resources" />
            <NavBtn to="/temp-tasks" icon={List} label="Temporary Tasks" />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-white text-sm">
              {userProfile.email}
              <p className="text-white text-sm font-medium truncate">
                Role: {isRealmAdmin ? 'Realm Admin' : 'User'}
              </p>
              <p className="text-blue-400 text-xs mt-1">
                Realm: {currentRealm?.name}
              </p>
            </div>
          </div>

          <SettingsMenu
            userProfile={userProfile}
            currentRealm={currentRealm}
            isRealmAdmin={isRealmAdmin}
          />
        </div>
      </div>

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Navigate to="/timeline" replace />} />
        <Route path="/timeline" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarDashboard />} />
        <Route path="/engineer" element={<EngineerBreakdownDashboard />} />
        <Route path="/kanban" element={<KanbanDashboard />} />
        <Route path="/gantt" element={<GanttChartDashboard />} />
        <Route path="/tasks" element={<TaskListDashboard />} />
        <Route path="/performance" element={<EngineerPerformanceDashboard />} />
        <Route path="/delays" element={<TaskDelayDashboard />} />
        <Route path="/history" element={<HistoryDashboard />} />
        <Route path="/resources" element={<ResourceAnalysisDashboard />} />
        <Route path="/config" element={<ConfigDashboard />} />
        <Route path="/temp-tasks" element={<TempTasksDashboard />} />
        <Route path="/login" element={null} />
        <Route path="*" element={<Navigate to="/timeline" replace />} />
      </Routes>
    </div>
  );
}

/* ================= NAV BUTTON ================= */

function NavBtn({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: any;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-slate-700 text-white'
            : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
        }`
      }
    >
      <Icon className="w-4 h-4" />
      {label}
    </NavLink>
  );
}

export default App;
