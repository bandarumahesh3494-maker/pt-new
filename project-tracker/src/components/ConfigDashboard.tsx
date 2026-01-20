import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, CreditCard as Edit2, Save, X, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeSelector } from './ThemeSelector';
import { AddPersonModal } from './AddPersonModal';
import { User } from '../types';
import { useTrackerData } from '../hooks/useTrackerData';
import { useAuth } from '../contexts/AuthContext';

interface MilestoneOption {
  value: string;
  label: string;
}

interface RowColors {
  planned: string;
  actual: string;
  subtask: string;
  subSubtask: string;
  plannedOpacity: number;
  actualOpacity: number;
  subtaskOpacity: number;
  subSubtaskOpacity: number;
}

interface CategoryColors {
  dev: string;
  test: string;
  infra: string;
  support: string;
}

interface CategoryOpacity {
  dev: number;
  test: number;
  infra: number;
  support: number;
}

// Default milestone options shared across all realms
const DEFAULT_MILESTONE_OPTIONS: MilestoneOption[] = [
  { value: 'planned', label: 'PLANNED' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'closed', label: 'CLOSED' },
  { value: 'dev-complete', label: 'Dev Complete' },
  { value: 'dev-merge-done', label: 'Dev Merge Done' },
  { value: 'staging-merge-done', label: 'Staging Merge Done' },
  { value: 'prod-merge-done', label: 'Prod Merge Done' },
];

export const ConfigDashboard: React.FC = () => {
  const { colors } = useTheme();
  // Only store custom milestone options (realm-specific)
  const [customMilestoneOptions, setCustomMilestoneOptions] = useState<MilestoneOption[]>([]);
  // Combined list for display
  const milestoneOptions = [...DEFAULT_MILESTONE_OPTIONS, ...customMilestoneOptions];
  const [rowColors, setRowColors] = useState<RowColors>({
    planned: '#3b82f6',
    actual: '#14b8a6',
    subtask: '#6366f1',
    subSubtask: '#f59e0b',
    plannedOpacity: 0.15,
    actualOpacity: 0.15,
    subtaskOpacity: 0.12,
    subSubtaskOpacity: 0.1
  });
  const [categoryColors, setCategoryColors] = useState<CategoryColors>({
    dev: '#06b6d4',
    test: '#8b5cf6',
    infra: '#f59e0b',
    support: '#ec4899'
  });
  const [categoryOpacity, setCategoryOpacity] = useState<CategoryOpacity>({
    dev: 1.0,
    test: 1.0,
    infra: 1.0,
    support: 1.0
  });
  // const [users, setUsers] = useState<User[]>([]);
    const {users} = useTrackerData();
     const {  userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editingMilestone, setEditingMilestone] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [tempMilestoneLabel, setTempMilestoneLabel] = useState('');
  const [tempUserName, setTempUserName] = useState('');
  const [tempUserRole, setTempUserRole] = useState('');

  useEffect(() => {
    if (userProfile?.realm_id) {
      loadConfig();
    }
  }, [userProfile?.realm_id]);

  const loadConfig = async () => {
    if (!userProfile?.realm_id) return;

    try {
      const { data: milestoneData } = await supabase
        .from('app_config')
        .select('config_value')
        .eq('config_key', 'milestone_options')
        .eq('realm_id', userProfile.realm_id)
        .maybeSingle();

      const { data: colorData } = await supabase
        .from('app_config')
        .select('config_value')
        .eq('config_key', 'row_colors')
        .eq('realm_id', userProfile.realm_id)
        .maybeSingle();

      const { data: categoryColorData } = await supabase
        .from('app_config')
        .select('config_value')
        .eq('config_key', 'category_colors')
        .eq('realm_id', userProfile.realm_id)
        .maybeSingle();

      const { data: categoryOpacityData } = await supabase
        .from('app_config')
        .select('config_value')
        .eq('config_key', 'category_opacity')
        .eq('realm_id', userProfile.realm_id)
        .maybeSingle();

      if (milestoneData) {
        setCustomMilestoneOptions(milestoneData.config_value as MilestoneOption[]);
      }

      if (colorData) {
        setRowColors(colorData.config_value as RowColors);
      }

      if (categoryColorData) {
        setCategoryColors(categoryColorData.config_value as CategoryColors);
      }

      if (categoryOpacityData) {
        setCategoryOpacity(categoryOpacityData.config_value as CategoryOpacity);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading config:', err);
      setLoading(false);
    }
  };


  const saveMilestoneOptions = async () => {
    try {
      const { error } = await supabase
        .from('app_config')
        .upsert({
          realm_id: userProfile?.realm_id,
          config_key: 'milestone_options',
          config_value: customMilestoneOptions,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'realm_id,config_key'
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving milestone options:', err);
    }
  };

  const saveRowColors = async () => {
    try {
      const { error } = await supabase
        .from('app_config')
        .upsert({
          realm_id: userProfile?.realm_id,
          config_key: 'row_colors',
          config_value: rowColors,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'realm_id,config_key'
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving row colors:', err);
    }
  };

  const saveCategoryColors = async () => {
    try {
      const { error: colorsError } = await supabase
        .from('app_config')
        .upsert({
          realm_id: userProfile?.realm_id,
          config_key: 'category_colors',
          config_value: categoryColors,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'realm_id,config_key'
        });

      const { error: opacityError } = await supabase
        .from('app_config')
        .upsert({
          realm_id: userProfile?.realm_id,
          config_key: 'category_opacity',
          config_value: categoryOpacity,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'realm_id,config_key'
        });

      if (colorsError) throw colorsError;
      if (opacityError) throw opacityError;
    } catch (err) {
      console.error('Error saving category colors:', err);
    }
  };

  const addMilestone = async () => {
    const newMilestone: MilestoneOption = {
      value: `custom-${Date.now()}`,
      label: 'New Milestone'
    };
    const updated = [...customMilestoneOptions, newMilestone];
    setCustomMilestoneOptions(updated);

    try {
      const { error } = await supabase
        .from('app_config')
        .upsert({
          realm_id: userProfile?.realm_id,
          config_key: 'milestone_options',
          config_value: updated,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'realm_id,config_key'
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving milestone options:', err);
    }
  };

  const updateMilestone = (index: number, label: string) => {
    // Only allow updating custom milestones
    if (index < DEFAULT_MILESTONE_OPTIONS.length) return;

    const customIndex = index - DEFAULT_MILESTONE_OPTIONS.length;
    const updated = [...customMilestoneOptions];
    updated[customIndex].label = label;
    setCustomMilestoneOptions(updated);
  };

  const deleteMilestone = async (index: number) => {
    // Only allow deleting custom milestones
    if (index < DEFAULT_MILESTONE_OPTIONS.length) return;

    const customIndex = index - DEFAULT_MILESTONE_OPTIONS.length;
    const updated = customMilestoneOptions.filter((_, i) => i !== customIndex);
    setCustomMilestoneOptions(updated);

    try {
      const { error } = await supabase
        .from('app_config')
        .upsert({
          realm_id: userProfile?.realm_id,
          config_key: 'milestone_options',
          config_value: updated,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'realm_id,config_key'
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving milestone options:', err);
    }
  };

  const saveMilestoneOptionsAndClose = async () => {
    await saveMilestoneOptions();
    setEditingMilestone(null);
  };

  const updateUser = async (userId: string, fullName: string, role: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('realm_id', userProfile?.realm_id);

      if (error) throw error;
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will unassign them from all tasks.')) {
      return;
    }

    try {
      await supabase
        .from('subtasks')
        .update({ assigned_to: null })
        .eq('assigned_to', userId)
        .eq('realm_id', userProfile?.realm_id);

      await supabase
        .from('sub_subtasks')
        .update({ assigned_to: null })
        .eq('assigned_to', userId)
        .eq('realm_id', userProfile?.realm_id);

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
        .eq('realm_id', userProfile?.realm_id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <div className={colors.text}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text}`}>
      <header className={`${colors.headerBg} border-b ${colors.border} px-6 py-4`}>
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold">Configuration</h1>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <section className={`${colors.cardBg} border ${colors.border} rounded-lg p-6`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Milestone Options
          </h2>
          <div className="space-y-2 mb-4">
            {milestoneOptions.map((option, index) => {
              const isDefault = index < DEFAULT_MILESTONE_OPTIONS.length;
              return (
                <div key={option.value} className={`flex items-center gap-2 p-3 ${colors.cardBg} border ${colors.border} rounded`}>
                  {editingMilestone === index ? (
                    <>
                      <input
                        type="text"
                        value={tempMilestoneLabel}
                        onChange={(e) => setTempMilestoneLabel(e.target.value)}
                        className="flex-1 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          updateMilestone(index, tempMilestoneLabel);
                          saveMilestoneOptionsAndClose();
                        }}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingMilestone(null)}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{option.label}</span>
                      {isDefault ? (
                        <span className="text-xs text-gray-500 px-2 py-1 rounded bg-gray-700">Default</span>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingMilestone(index);
                              setTempMilestoneLabel(option.label);
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteMilestone(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={addMilestone}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Milestone Option
          </button>
        </section>

        <section className={`${colors.cardBg} border ${colors.border} rounded-lg p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Engineers / Team Members</h2>
            {/* <button
              onClick={() => setShowAddPerson(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Add Person
            </button> */}
          </div>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className={`flex items-center gap-2 p-3 ${colors.cardBg} border ${colors.border} rounded`}>
                {editingUser === user.id ? (
                  <>
                    <input
                      type="text"
                      value={tempUserName}
                      onChange={(e) => setTempUserName(e.target.value)}
                      placeholder="Full Name"
                      className="flex-1 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={tempUserRole}
                      onChange={(e) => setTempUserRole(e.target.value)}
                      placeholder="Role"
                      className="w-40 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => updateUser(user.id, tempUserName, tempUserRole)}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{user.full_name || user.email}</span>
                    <span className="text-gray-400 w-40">{user.role}</span>
                    <button
                      onClick={() => {
                        setEditingUser(user.id);
                        setTempUserName(user.full_name || user.email);
                        setTempUserRole(user.role);
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-gray-400 text-center py-4">No team members yet. Click "Add Person" to get started.</p>
            )}
          </div>
        </section>

        <section className={`${colors.cardBg} border ${colors.border} rounded-lg p-6`}>
          <h2 className="text-xl font-semibold mb-4">Color Theme</h2>
          <ThemeSelector />
        </section>

        <section className={`${colors.cardBg} border ${colors.border} rounded-lg p-6`}>
          <h2 className="text-xl font-semibold mb-4">Row Colors & Opacity</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">PLANNED Row</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Color:</label>
                  <input
                    type="color"
                    value={rowColors.planned}
                    onChange={(e) => setRowColors({ ...rowColors, planned: e.target.value })}
                    className="w-20 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={rowColors.planned}
                    onChange={(e) => setRowColors({ ...rowColors, planned: e.target.value })}
                    className="w-32 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Opacity:</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={rowColors.plannedOpacity}
                    onChange={(e) => setRowColors({ ...rowColors, plannedOpacity: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={rowColors.plannedOpacity}
                    onChange={(e) => setRowColors({ ...rowColors, plannedOpacity: parseFloat(e.target.value) })}
                    className="w-20 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div
                  className="h-12 rounded border border-gray-600 flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: `${rowColors.planned}${Math.round(rowColors.plannedOpacity * 255).toString(16).padStart(2, '0')}`
                  }}
                >
                  Preview
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">ACTUAL Row</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Color:</label>
                  <input
                    type="color"
                    value={rowColors.actual}
                    onChange={(e) => setRowColors({ ...rowColors, actual: e.target.value })}
                    className="w-20 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={rowColors.actual}
                    onChange={(e) => setRowColors({ ...rowColors, actual: e.target.value })}
                    className="w-32 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Opacity:</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={rowColors.actualOpacity}
                    onChange={(e) => setRowColors({ ...rowColors, actualOpacity: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={rowColors.actualOpacity}
                    onChange={(e) => setRowColors({ ...rowColors, actualOpacity: parseFloat(e.target.value) })}
                    className="w-20 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div
                  className="h-12 rounded border border-gray-600 flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: `${rowColors.actual}${Math.round(rowColors.actualOpacity * 255).toString(16).padStart(2, '0')}`
                  }}
                >
                  Preview
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Subtask Rows</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Color:</label>
                  <input
                    type="color"
                    value={rowColors.subtask}
                    onChange={(e) => setRowColors({ ...rowColors, subtask: e.target.value })}
                    className="w-20 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={rowColors.subtask}
                    onChange={(e) => setRowColors({ ...rowColors, subtask: e.target.value })}
                    className="w-32 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Opacity:</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={rowColors.subtaskOpacity}
                    onChange={(e) => setRowColors({ ...rowColors, subtaskOpacity: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={rowColors.subtaskOpacity}
                    onChange={(e) => setRowColors({ ...rowColors, subtaskOpacity: parseFloat(e.target.value) })}
                    className="w-20 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div
                  className="h-12 rounded border border-gray-600 flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: `${rowColors.subtask}${Math.round(rowColors.subtaskOpacity * 255).toString(16).padStart(2, '0')}`
                  }}
                >
                  Preview
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Sub-Subtask Rows</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Color:</label>
                  <input
                    type="color"
                    value={rowColors.subSubtask}
                    onChange={(e) => setRowColors({ ...rowColors, subSubtask: e.target.value })}
                    className="w-20 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={rowColors.subSubtask}
                    onChange={(e) => setRowColors({ ...rowColors, subSubtask: e.target.value })}
                    className="w-32 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Opacity:</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={rowColors.subSubtaskOpacity}
                    onChange={(e) => setRowColors({ ...rowColors, subSubtaskOpacity: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={rowColors.subSubtaskOpacity}
                    onChange={(e) => setRowColors({ ...rowColors, subSubtaskOpacity: parseFloat(e.target.value) })}
                    className="w-20 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div
                  className="h-12 rounded border border-gray-600 flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: `${rowColors.subSubtask}${Math.round(rowColors.subSubtaskOpacity * 255).toString(16).padStart(2, '0')}`
                  }}
                >
                  Preview
                </div>
              </div>
            </div>

            <button
              onClick={saveRowColors}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Row Colors & Opacity
            </button>
          </div>
        </section>

        <section className={`${colors.cardBg} border ${colors.border} rounded-lg p-6`}>
          <h2 className="text-xl font-semibold mb-4">Task Category Colors & Opacity</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">DEV</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Color:</label>
                  <input
                    type="color"
                    value={categoryColors.dev}
                    onChange={(e) => setCategoryColors({ ...categoryColors, dev: e.target.value })}
                    className="w-20 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={categoryColors.dev}
                    onChange={(e) => setCategoryColors({ ...categoryColors, dev: e.target.value })}
                    className="w-32 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Opacity:</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={categoryOpacity.dev}
                    onChange={(e) => setCategoryOpacity({ ...categoryOpacity, dev: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={categoryOpacity.dev}
                    onChange={(e) => setCategoryOpacity({ ...categoryOpacity, dev: parseFloat(e.target.value) })}
                    className="w-20 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div
                  className="h-12 rounded border border-gray-600 flex items-center justify-center text-sm font-medium"
                  style={{
                    backgroundColor: `${categoryColors.dev}${Math.round(categoryOpacity.dev * 255).toString(16).padStart(2, '0')}`
                  }}
                >
                  DEV Preview
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">TEST</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Color:</label>
                  <input
                    type="color"
                    value={categoryColors.test}
                    onChange={(e) => setCategoryColors({ ...categoryColors, test: e.target.value })}
                    className="w-20 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={categoryColors.test}
                    onChange={(e) => setCategoryColors({ ...categoryColors, test: e.target.value })}
                    className="w-32 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Opacity:</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={categoryOpacity.test}
                    onChange={(e) => setCategoryOpacity({ ...categoryOpacity, test: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={categoryOpacity.test}
                    onChange={(e) => setCategoryOpacity({ ...categoryOpacity, test: parseFloat(e.target.value) })}
                    className="w-20 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div
                  className="h-12 rounded border border-gray-600 flex items-center justify-center text-sm font-medium"
                  style={{
                    backgroundColor: `${categoryColors.test}${Math.round(categoryOpacity.test * 255).toString(16).padStart(2, '0')}`
                  }}
                >
                  TEST Preview
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">INFRA</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Color:</label>
                  <input
                    type="color"
                    value={categoryColors.infra}
                    onChange={(e) => setCategoryColors({ ...categoryColors, infra: e.target.value })}
                    className="w-20 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={categoryColors.infra}
                    onChange={(e) => setCategoryColors({ ...categoryColors, infra: e.target.value })}
                    className="w-32 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Opacity:</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={categoryOpacity.infra}
                    onChange={(e) => setCategoryOpacity({ ...categoryOpacity, infra: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={categoryOpacity.infra}
                    onChange={(e) => setCategoryOpacity({ ...categoryOpacity, infra: parseFloat(e.target.value) })}
                    className="w-20 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div
                  className="h-12 rounded border border-gray-600 flex items-center justify-center text-sm font-medium"
                  style={{
                    backgroundColor: `${categoryColors.infra}${Math.round(categoryOpacity.infra * 255).toString(16).padStart(2, '0')}`
                  }}
                >
                  INFRA Preview
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">SUPPORT</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Color:</label>
                  <input
                    type="color"
                    value={categoryColors.support}
                    onChange={(e) => setCategoryColors({ ...categoryColors, support: e.target.value })}
                    className="w-20 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={categoryColors.support}
                    onChange={(e) => setCategoryColors({ ...categoryColors, support: e.target.value })}
                    className="w-32 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-32 font-medium">Opacity:</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={categoryOpacity.support}
                    onChange={(e) => setCategoryOpacity({ ...categoryOpacity, support: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={categoryOpacity.support}
                    onChange={(e) => setCategoryOpacity({ ...categoryOpacity, support: parseFloat(e.target.value) })}
                    className="w-20 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div
                  className="h-12 rounded border border-gray-600 flex items-center justify-center text-sm font-medium"
                  style={{
                    backgroundColor: `${categoryColors.support}${Math.round(categoryOpacity.support * 255).toString(16).padStart(2, '0')}`
                  }}
                >
                  SUPPORT Preview
                </div>
              </div>
            </div>

            <button
              onClick={saveCategoryColors}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Category Colors & Opacity
            </button>
          </div>
        </section>
      </div>

      {showAddPerson && (
        <AddPersonModal
          isOpen={true}
          onClose={() => {
            setShowAddPerson(false);
          }}
          users={users}
        />
      )}
    </div>
  );
};
