import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Save, X, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { AddTaskModal } from './AddTaskModal';
import { StatsCards } from './StatsCards';
import { AddTempTaskModal } from './AddTempTaskModal';
import { useAuth } from '../../contexts/AuthContext';
import { useTrackerData } from '../../hooks/useTrackerData';

type SortColumn = 'title' | 'priority' | 'engineer_name' | 'created_by' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';

export function TempTasksDashboard() {
const [tasks, setTasks] = useState<any[]>([]);
const [allTasks, setAllTasks] = useState<any[]>([]);
const [editingId, setEditingId] = useState<string | null>(null);
const [cardsdata, setcardsdata] = useState<any>(null);
const [editForm, setEditForm] = useState<any>({});
 const { userProfile } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
 const { users } = useTrackerData();
  const [sortColumn, setSortColumn] = useState<SortColumn>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTasks();
    fetchAllTasks();
  }, [sortColumn, sortDirection, currentPage]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await supabase
        .from('temp_tasks')
        .select('*', { count: 'exact' })
        .eq('realm_id', userProfile.realm_id)
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range(from, to); 

      if (error) throw error;
      setTasks(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('temp_tasks')
        .select('*')
        .eq('realm_id', userProfile.realm_id)
console.log('Fetched all tasks:', data);
      if (error) throw error;
      setAllTasks(data || []);
      setcardsdata(data || []);
      console.log('All tasks set in state:', allTasks);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
    }
    console.log('All tasks after userProfile:', userProfile);
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setEditForm(task);
  };

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('temp_tasks')
        .update({ ...editForm, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchTasks();
      await fetchAllTasks();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('temp_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTasks();
      await fetchAllTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown size={16} className="text-gray-500" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp size={16} className="text-blue-400" />
    ) : (
      <ChevronDown size={16} className="text-blue-400" />
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'assigned':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'project-task-created':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'de-prioritized':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'created':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
// const canEditTask = (task: any) => {
//   if (!userProfile) return false;

//   const isCreator = task.created_by === userProfile.id;
//   const isAssignee = task.user_id === userProfile.id;

//   return isCreator || isAssignee;
// };
const canEditTask = (task: any) => {
  console.log('Checking edit permissions for task:', task, 'with userProfile:', userProfile);
  return (
    userProfile.role === 'admin' ||
    task.created_by === userProfile.id ||
    task.user_id === userProfile.id ||
    userProfile.realm_id === task.realm_id
  );
};
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-650 text-gray-100 px-6 py-0">
      <div className=" mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Temporary Task Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage and track your team's tasks</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>

        <StatsCards tasks={cardsdata} />

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Task ID</th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 transition-colors"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      Task Name
                      <SortIcon column="title" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 transition-colors"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-2">
                      Priority
                      <SortIcon column="priority" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 transition-colors"
                    onClick={() => handleSort('engineer_name')}
                  >
                    <div className="flex items-center gap-2">
                      Assigned-to
                      <SortIcon column="engineer_name" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 transition-colors"
                    onClick={() => handleSort('created_by')}
                  >
                    <div className="flex items-center gap-2">
                      Created by
                      <SortIcon column="created_by" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <SortIcon column="status" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-700/30 transition-colors"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-2">
                      Created
                      <SortIcon column="created_at" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                      {task.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === task.id ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-sm text-white">{task.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === task.id ? (
                        <select
                          value={editForm.priority || ''}
                          onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Task['priority'] })}
                          className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === task.id ?
                       (
                        // <input
                        //   type="text"
                        //   value={editForm.user_id || ''}
                        //   onChange={(e) => setEditForm({ ...editForm, user_id: e.target.value })} 
                        //   className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        // />
                          <select
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={editForm.user_id}
            onChange={(e) =>{
                const userId = e.target.value;
                const user = users.find(u => u.id === userId);
                console.log('Selected option data-email:', user?.email);
                setEditForm({ ...editForm, user_id: e.target.value,assigned_byname: user?.email || '' })
            }
            }
          >
            <option value="">Assign to</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
                      ) : (
                        <span className="text-sm text-gray-300">{task.assigned_byname}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-sm text-gray-300">{task.created_byname}</span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === task.id ? (
                        <select
                          value={editForm.status || ''}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Task['status'] })}
                          className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="created">Created</option>
                          <option value="assigned">Assigned</option>
                          <option value="project-task-created">Project Task Created</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="de-prioritized">De-prioritized</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(task.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {editingId === task.id ? (
                          <>
                            <button
                              onClick={() => handleSave(task.id)}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                              title="Save"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-1.5 text-gray-400 hover:bg-gray-700 rounded transition-colors"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                           <button disabled={!canEditTask(task)}
                                  onClick={() => handleEdit(task)}
                                  className={`p-1.5 rounded transition-colors
                                    ${canEditTask(task)
                                      ? 'text-blue-400 hover:bg-blue-500/10'
                                      : 'text-gray-500 cursor-not-allowed opacity-50'
                                    }
                                  `}>
                                  <Edit2 size={16} />
                                </button>
                            <button disabled={!canEditTask(task)}
                                onClick={() => handleDelete(task.id)}
                                title={canEditTask(task) ? 'Delete' : 'You do not have permission'}
                                className={`p-1.5 rounded transition-colors
                                  ${canEditTask(task)
                                    ? 'text-red-400 hover:bg-red-500/10'
                                    : 'text-gray-500 cursor-not-allowed opacity-50'
                                  }
                                `}>
                                <Trash2 size={16} />
                              </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tasks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No tasks yet. Click "New Task" to create one.
              </div>
            )}
          </div>

          {totalCount > itemsPerPage && (
            <div className="border-t border-gray-800 bg-gray-800/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} tasks
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                      return false;
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      return (
                        <div key={page} className="flex items-center gap-2">
                          {showEllipsis && (
                            <span className="text-gray-500 px-2">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddTempTaskModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchTasks();
            fetchAllTasks();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
