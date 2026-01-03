import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Support = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [faqs, setFaqs] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewComplaint, setShowNewComplaint] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // New complaint form
  const [complaintForm, setComplaintForm] = useState({
    subject: '',
    category: 'other',
    description: '',
    event_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [faqRes, complaintsRes] = await Promise.all([
        api.get('/support/faq'),
        api.get('/support/complaints/my')
      ]);

      setFaqs(faqRes.data.data || []);
      setMyComplaints(complaintsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/support/complaints', complaintForm);
      if (response.data.success) {
        // Refetch complaints to get the complete data
        const complaintsRes = await api.get('/support/complaints/my');
        setMyComplaints(complaintsRes.data.data || []);
        setShowNewComplaint(false);
        setComplaintForm({ subject: '', category: 'other', description: '', event_id: '' });
        alert('Ticket submitted successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit complaint');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    };
    return badges[status] || badges.open;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      event_issue: '📅',
      venue_issue: '🏛️',
      certificate_issue: '📜',
      registration_issue: '📝',
      technical_issue: '🔧',
      other: '❓'
    };
    return icons[category] || '❓';
  };

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    const cat = faq.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Help & Support
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'faq'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📚 FAQ
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'complaints'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🎫 My Tickets ({myComplaints.length})
          </button>
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            {Object.keys(groupedFaqs).length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                <span className="text-5xl mb-4 block">📚</span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No FAQs available yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Check back later or submit a support ticket
                </p>
              </div>
            ) : (
              Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="font-semibold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                      {getCategoryIcon(category)} {category.replace('_', ' ')}
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {categoryFaqs.map((faq) => (
                      <div key={faq.id} className="p-4">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <span className="font-medium text-gray-900 dark:text-white pr-4">
                            {faq.question}
                          </span>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              expandedFaq === faq.id ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {expandedFaq === faq.id && (
                          <div className="mt-3 text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-blue-500">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* Contact Support CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-2">Didn't find what you're looking for?</h3>
              <p className="opacity-90 mb-4">Submit a support ticket and we'll get back to you</p>
              <button
                onClick={() => { setActiveTab('complaints'); setShowNewComplaint(true); }}
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Submit a Ticket
              </button>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewComplaint(!showNewComplaint)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Ticket
              </button>
            </div>

            {/* New Complaint Form */}
            {showNewComplaint && (
              <form onSubmit={submitComplaint} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Submit Support Ticket
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={complaintForm.subject}
                      onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={complaintForm.category}
                      onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="event_issue">Event Issue</option>
                      <option value="venue_issue">Venue Issue</option>
                      <option value="certificate_issue">Certificate Issue</option>
                      <option value="registration_issue">Registration Issue</option>
                      <option value="technical_issue">Technical Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={complaintForm.description}
                      onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                      required
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Describe your issue in detail..."
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowNewComplaint(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Complaints List */}
            {myComplaints.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                <span className="text-5xl mb-4 block">🎫</span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No support tickets
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  You haven't submitted any support tickets yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span>{getCategoryIcon(complaint.category)}</span>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {complaint.subject}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Ticket #{complaint.id} • {new Date(complaint.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {complaint.description}
                    </p>

                    {/* Responses */}
                    {complaint.responses && complaint.responses.length > 0 && (
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Responses
                        </h4>
                        <div className="space-y-3">
                          {complaint.responses.map((response, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                  {response.responder_name || 'Support Team'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(response.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {response.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
