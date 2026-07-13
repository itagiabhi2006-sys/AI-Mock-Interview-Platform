import React, { useEffect, useState } from 'react';
import { HelpCircle, Trash2, Plus, X, Search } from 'lucide-react';
import api from '../../Api';
import toast from 'react-hot-toast';

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    text: '',
    idealAnswer: '',
    domain: '',
    topic: '',
    subTopic: '',
    difficultyLevel: '',
    expectedConcepts: '',
    keywords: '',
    aiGenerated: false,
    status: 'ACTIVE'
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/questions');
      setQuestions(response.data);
    } catch (err) {
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this question?")) return;
    try {
      await api.delete(`/api/admin/questions/${id}`);
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/questions', formData);
      toast.success('Question created successfully');
      setShowModal(false);
      setFormData({
        text: '', idealAnswer: '', domain: '', topic: '', subTopic: '',
        difficultyLevel: '', expectedConcepts: '', keywords: '', aiGenerated: false, status: 'ACTIVE'
      });
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to create question');
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Questions</h1>
          <p className="text-gray-500 mt-1">Add, edit, or remove interview questions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search questions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-64"
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider w-1/2">Question</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Domain / Topic</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Difficulty</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">No questions found.</td>
                  </tr>
                ) : (
                  filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="text-gray-900 font-medium line-clamp-2 text-sm">{q.text}</p>
                        <p className="text-gray-400 text-xs mt-1">ID: {q.id} • Status: {q.status}</p>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className="font-medium text-gray-700 block">{q.domain}</span>
                        <span className="text-gray-500 text-xs">{q.topic} {q.subTopic ? `> ${q.subTopic}` : ''}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          q.difficultyLevel === 'EASY' ? 'bg-green-100 text-green-700' :
                          q.difficultyLevel === 'HARD' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {q.difficultyLevel || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleDelete(q.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New Question</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="questionForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Question Text</label>
                  <textarea 
                    name="text" required value={formData.text} onChange={handleInputChange} rows={3}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ideal Answer</label>
                  <textarea 
                    name="idealAnswer" required value={formData.idealAnswer} onChange={handleInputChange} rows={3}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Domain (Job Role)</label>
                    <input type="text" name="domain" value={formData.domain} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty Level</label>
                    <select name="difficultyLevel" value={formData.difficultyLevel} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 bg-white">
                      <option value="">Select Difficulty</option>
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Topic</label>
                    <input type="text" name="topic" value={formData.topic} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sub Topic</label>
                    <input type="text" name="subTopic" value={formData.subTopic} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Expected Concepts (comma separated)</label>
                  <input type="text" name="expectedConcepts" value={formData.expectedConcepts} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Keywords (comma separated)</label>
                  <input type="text" name="keywords" value={formData.keywords} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500" />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                    <input type="checkbox" name="aiGenerated" checked={formData.aiGenerated} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded" />
                    AI Generated
                  </label>

                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                    Status:
                    <select name="status" value={formData.status} onChange={handleInputChange} className="border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 bg-white ml-2">
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100">
                Cancel
              </button>
              <button type="submit" form="questionForm" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium">
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
