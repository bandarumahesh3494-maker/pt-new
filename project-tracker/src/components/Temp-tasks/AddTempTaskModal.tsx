import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTrackerData } from '../../hooks/useTrackerData';

interface AddTaskModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddTempTaskModal({ onClose, onSuccess }: AddTaskModalProps) {
  const { userProfile } = useAuth();
  const { users } = useTrackerData();

  const [formData, setFormData] = useState({
    name: '',
    priority: 'medium',
    user_id: null,
    status: 'created',
    created_byname: '',
    assigned_byname: '',
    realm_id : userProfile?.realm_id || ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile) {
      alert('User not authenticated');
      return;
    }

    setLoading(true);

    try {

      const { error } = await supabase.from('temp_tasks').insert([
        {
          ...formData,
          created_by: userProfile.id,
          created_byname: userProfile.email || '',
          assigned_byname: formData.assigned_byname || '',
           realm_id : userProfile?.realm_id || ''
        }
      ]);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
        <div className="flex justify-between p-6 border-b border-gray-800">
          <h2 className="text-white text-xl">Add Temporary Task</h2>
          <button onClick={onClose}><X className="text-gray-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
           <label className="block text-sm font-medium text-gray-300 mb-2">
              Task Name
            </label>
          <input
            required
            placeholder="Task name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
 <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
          {/* Priority */}
          <select
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

           <label className="block text-sm font-medium text-gray-300 mb-2">
             Assigned-to
            </label>
          <select
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.user_id}
            onChange={(e) =>{
                const userId = e.target.value;
                const user = users.find(u => u.id === userId);
                console.log('Selected option data-email:', user?.email);
                setFormData({ ...formData, user_id: e.target.value,assigned_byname: user?.email || '' })
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

         <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
          <select
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="created">Created</option>
            <option value="assigned">Assigned</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white rounded p-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded p-2"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
