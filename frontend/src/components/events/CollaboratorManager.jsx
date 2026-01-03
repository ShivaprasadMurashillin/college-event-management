import { useState, useEffect } from 'react';
import api from '../../services/api';

const CollaboratorManager = ({ eventId, isOwner = false }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [newCollaborator, setNewCollaborator] = useState({
    user_email: '',
    permission_level: 'view'
  });

  useEffect(() => {
    fetchCollaborators();
  }, [eventId]);

  const fetchCollaborators = async () => {
    try {
      const response = await api.get(`/collaborators/event/${eventId}`);
      if (response.data.success) {
        setCollaborators(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const response = await api.get(`/collaborators/activity/${eventId}`);
      if (response.data.success) {
        setActivityLog(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const addCollaborator = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/collaborators', {
        event_id: eventId,
        ...newCollaborator
      });
      if (response.data.success) {
        fetchCollaborators();
        setShowAddForm(false);
        setNewCollaborator({ user_email: '', permission_level: 'view' });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add collaborator');
    }
  };

  const updatePermission = async (collabId, permission_level) => {
    try {
      await api.put(`/collaborators/${collabId}`, { permission_level });
      fetchCollaborators();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update permission');
    }
  };

  const removeCollaborator = async (collabId) => {
    if (!confirm('Remove this collaborator?')) return;
    try {
      await api.delete(`/collaborators/${collabId}`);
      setCollaborators(prev => prev.filter(c => c.id !== collabId));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove collaborator');
    }
  };

  const toggleActivity = () => {
    if (!showActivity) {
      fetchActivityLog();
    }
    setShowActivity(!showActivity);
  };

  const getPermissionBadge = (level) => {
    const badges = {
      view: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      edit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      manage_registrations: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      full: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    return badges[level] || badges.view;
  };

  const getActionIcon = (action) => {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      publish: '📢',
      registration: '📝'
    };
    return icons[action] || '📋';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          👥 Collaborators
        </h3>
        <div className="flex gap-2">
          <button
            onClick={toggleActivity}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            📋 Activity
          </button>
          {isOwner && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              + Add
            </button>
          )}
        </div>
      </div>

      {/* Add Collaborator Form */}
      {showAddForm && (
        <form onSubmit={addCollaborator} className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={newCollaborator.user_email}
              onChange={(e) => setNewCollaborator({ ...newCollaborator, user_email: e.target.value })}
              placeholder="Collaborator's email"
              required
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <select
              value={newCollaborator.permission_level}
              onChange={(e) => setNewCollaborator({ ...newCollaborator, permission_level: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
              <option value="manage_registrations">Manage Registrations</option>
              <option value="full">Full Access</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* Collaborators List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {collaborators.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <span className="text-3xl mb-2 block">👥</span>
            No collaborators yet
          </div>
        ) : (
          collaborators.map((collab) => (
            <div key={collab.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {(collab.name?.[0] || collab.email?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {collab.name || collab.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {collab.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isOwner ? (
                  <>
                    <select
                      value={collab.permission_level}
                      onChange={(e) => updatePermission(collab.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 ${getPermissionBadge(collab.permission_level)}`}
                    >
                      <option value="view">View Only</option>
                      <option value="edit">Can Edit</option>
                      <option value="manage_registrations">Manage Registrations</option>
                      <option value="full">Full Access</option>
                    </select>
                    <button
                      onClick={() => removeCollaborator(collab.id)}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <span className={`text-xs px-3 py-1 rounded-full ${getPermissionBadge(collab.permission_level)}`}>
                    {collab.permission_level.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Activity Log */}
      {showActivity && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Activity Log</h4>
            {activityLog.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No activity recorded yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activityLog.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <span>{getActionIcon(log.action)}</span>
                    <div className="flex-1">
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>{log.user_name}</strong> {log.details}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorManager;
