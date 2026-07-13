import React, { useEffect, useState } from 'react';
import { Users, UserCheck, HelpCircle, Activity } from 'lucide-react';
import api from '../../Api';

export default function AdminOverview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get('/api/admin/analytics/overview');
        setOverview(response.data);
      } catch (err) {
        setError('Failed to load overview data.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center">
        {error}
      </div>
    );
  }

  // Fallback assuming the structure since exact fields weren't fully provided, 
  // but it's an overview entity, usually containing counts.
  const stats = [
    { 
      title: 'Total Users', 
      value: overview?.totalUsers || 0, 
      icon: Users,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50'
    },
    { 
      title: 'Active Users', 
      value: overview?.activeUsers || 0, 
      icon: UserCheck,
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50'
    },
    { 
      title: 'Total Questions', 
      value: overview?.totalQuestions || 0, 
      icon: HelpCircle,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50'
    },
    { 
      title: 'Interviews Taken', 
      value: overview?.totalInterviews || 0, 
      icon: Activity,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50'
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome to the admin control panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-xl ${stat.bgLight}`}>
                <stat.icon className={`w-6 h-6 text-white mix-blend-multiply ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional Analytics can go here later */}
      <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center">
        <p className="text-gray-400">More analytics charts can be displayed here...</p>
      </div>
    </div>
  );
}
