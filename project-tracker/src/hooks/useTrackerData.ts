import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Task,
  Subtask,
  SubSubtask,
  Milestone,
  User,
  GroupedData
} from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useTrackerData = () => {
  const { currentRealm } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subSubtasks, setSubSubtasks] = useState<SubSubtask[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    // 🛑 HARD GUARD: wait for realm
    if (!currentRealm?.id) {
      console.log('[Tracker] Waiting for currentRealm...');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // DEMO MODE: Skip auth check for demo, data will be fetched without user context
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      // Allow proceeding even without authenticated user for demo mode
      if (user) {
        setUser(user);
      }

      console.log('[Tracker] Fetching data for realm:', currentRealm.id);

      const [
        tasksRes,
        subtasksRes,
        subSubtasksRes,
        milestonesRes,
        usersRes
      ] = await Promise.all([
        supabase.from('tasks').select('*').order('category', { ascending: true }),
        supabase.from('subtasks').select('*'),
        supabase
          .from('sub_subtasks')
          .select('*')
          .order('order_index', { ascending: true }),
        supabase.from('milestones').select('*'),
        supabase
          .from('profiles')
          .select('*')
          .eq('realm_id', currentRealm.id)
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (subtasksRes.error) throw subtasksRes.error;
      if (subSubtasksRes.error) throw subSubtasksRes.error;
      if (milestonesRes.error) throw milestonesRes.error;
      if (usersRes.error) throw usersRes.error;

      setTasks(tasksRes.data || []);
      setSubtasks(subtasksRes.data || []);
      setSubSubtasks(subSubtasksRes.data || []);
      setMilestones(milestonesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err: any) {
      console.error('[Tracker] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentRealm?.id) return;

    fetchData();

    const channel = supabase.channel('tracker_changes');

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, (payload) => {
        console.log('[Realtime] Task INSERT', payload.new);
        setTasks(prev => [...prev, payload.new as Task]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, (payload) => {
        console.log('[Realtime] Task UPDATE', payload.new);
        setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as Task : t));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, (payload) => {
        console.log('[Realtime] Task DELETE', payload.old);
        setTasks(prev => prev.filter(t => t.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subtasks' }, (payload) => {
        console.log('[Realtime] Subtask INSERT', payload.new);
        setSubtasks(prev => [...prev, payload.new as Subtask]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'subtasks' }, (payload) => {
        console.log('[Realtime] Subtask UPDATE', payload.new);
        setSubtasks(prev => prev.map(st => st.id === payload.new.id ? payload.new as Subtask : st));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'subtasks' }, (payload) => {
        console.log('[Realtime] Subtask DELETE', payload.old);
        setSubtasks(prev => prev.filter(st => st.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sub_subtasks' }, (payload) => {
        console.log('[Realtime] Sub-subtask INSERT', payload.new);
        setSubSubtasks(prev => [...prev, payload.new as SubSubtask]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sub_subtasks' }, (payload) => {
        console.log('[Realtime] Sub-subtask UPDATE', payload.new);
        setSubSubtasks(prev => prev.map(sst => sst.id === payload.new.id ? payload.new as SubSubtask : sst));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'sub_subtasks' }, (payload) => {
        console.log('[Realtime] Sub-subtask DELETE', payload.old);
        setSubSubtasks(prev => prev.filter(sst => sst.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'milestones' }, (payload) => {
        console.log('[Realtime] Milestone INSERT', payload.new);
        setMilestones(prev => [...prev, payload.new as Milestone]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'milestones' }, (payload) => {
        console.log('[Realtime] Milestone UPDATE', payload.new);
        setMilestones(prev => prev.map(m => m.id === payload.new.id ? payload.new as Milestone : m));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'milestones' }, (payload) => {
        console.log('[Realtime] Milestone DELETE', payload.old);
        setMilestones(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        console.log('[Realtime] Profile INSERT', payload.new);
        if (payload.new.realm_id === currentRealm.id) {
          setUsers(prev => [...prev, payload.new as User]);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        console.log('[Realtime] Profile UPDATE', payload.new);
        if (payload.new.realm_id === currentRealm.id) {
          setUsers(prev => prev.map(u => u.id === payload.new.id ? payload.new as User : u));
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'profiles' }, (payload) => {
        console.log('[Realtime] Profile DELETE', payload.old);
        setUsers(prev => prev.filter(u => u.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRealm?.id]);

  const groupedData: GroupedData[] = tasks.map(task => ({
    task,
    subtasks: subtasks
      .filter(st => st.task_id === task.id)
      .map(subtask => ({
        subtask,
        assignedUser: users.find(u => u.id === subtask.assigned_to) || null,
        milestones: milestones.filter(m => m.subtask_id === subtask.id),
        subSubtasks: subSubtasks
          .filter(sst => sst.subtask_id === subtask.id)
          .map(subSubtask => ({
            subSubtask,
            assignedUser: users.find(u => u.id === subSubtask.assigned_to) || null,
            milestones: milestones.filter(
              m => m.sub_subtask_id === subSubtask.id
            )
          }))
      }))
  }));

  return {
    tasks,
    subtasks,
    milestones,
    users,
    groupedData,
    loading,
    error,
    refetch: fetchData
  };
};
