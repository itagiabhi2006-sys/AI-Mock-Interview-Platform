import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { User, Brain, Award, TrendingUp, Clock, Target, BookOpen, Zap, Activity } from "lucide-react";
import api from "../Api"; 

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgScore: 0,
    mostActiveField: "",
    improvement: 0,
    totalHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("overview");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/api/interview/history");
        const data = res.data || [];
        setSessions(data);
        computeStats(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const computeStats = (data) => {
    if (!data.length) return;

    const totalSessions = data.length;
    const avgScore = data.reduce((sum, s) => sum + (s.averageScore || 0), 0) / totalSessions;

    const totalHours = data.reduce((sum, s) => {
      if (s.startedAt && s.finishedAt) {
        const start = new Date(s.startedAt);
        const end = new Date(s.finishedAt);
        return sum + (end - start) / (1000 * 60 * 60);
      }
      return sum;
    }, 0);

    const fieldCount = {};
    data.forEach(s => {
      fieldCount[s.role] = (fieldCount[s.role] || 0) + 1;
    });
    const mostActiveField = Object.entries(fieldCount).sort((a,b) => b[1]-a[1])[0]?.[0] || "";

    const sortedData = [...data].sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
    const firstThree = sortedData.slice(0,3).reduce((sum, s) => sum + (s.averageScore || 0), 0) / Math.min(3, sortedData.length);
    const lastThree = sortedData.slice(-3).reduce((sum, s) => sum + (s.averageScore || 0), 0) / Math.min(3, sortedData.length);
    const improvement = lastThree - firstThree;

    setStats({ totalSessions, avgScore, mostActiveField, improvement, totalHours });
  };

  const chartData = Object.values(
    sessions.reduce((acc, s) => {
      if (!acc[s.role]) acc[s.role] = { role: s.role, count: 0, avgScore: 0 };
      acc[s.role].count += 1;
      acc[s.role].avgScore += s.averageScore || 0;
      return acc;
    }, {})
  ).map(item => ({
    role: item.role,
    avgScore: parseFloat((item.avgScore / item.count).toFixed(1)),
    count: item.count
  }));

  const trendData = [...sessions]
    .sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt))
    .map((s, i) => {
      const date = new Date(s.startedAt);
      return {
        session: i+1,
        score: s.averageScore,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDateTime: date.toLocaleString('en-US', { month: 'short', day: 'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' }),
        role: s.role
      };
    });

  const pieData = chartData.map(item => ({ name: item.role, value: item.count }));
  const radarData = chartData.map(item => ({ role: item.role.split(' ')[0], score: item.avgScore, fullMark: 100 }));

  const sidebarItems = [
    { id: "overview", label: "Overall Performance", icon: Activity, color: "bg-indigo-500" },
    { id: "trends", label: "Performance Trends", icon: TrendingUp, color: "bg-purple-500" },
    { id: "roles", label: "Role Analysis", icon: Target, color: "bg-pink-500" },
    { id: "insights", label: "Insights & Tips", icon: Brain, color: "bg-blue-500" },
    { id: "history", label: "Session History", icon: BookOpen, color: "bg-green-500" }
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50">
      <div className="text-center bg-white/60 backdrop-blur-2xl p-12 rounded-3xl shadow-xl border border-white/80">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">Loading your interview insights...</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(selectedView){
      case "overview":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <User className="opacity-80" size={32}/>
                  <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-semibold">Total</div>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.totalSessions}</p>
                <p className="text-blue-100 text-sm">Interview Sessions</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <Award className="opacity-80" size={32}/>
                  <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-semibold">Avg</div>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.avgScore.toFixed(1)}%</p>
                <p className="text-green-100 text-sm">Average Score</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="opacity-80" size={32}/>
                  <div className={`bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-semibold ${stats.improvement>=0?'':'bg-red-500'}`}>
                    {stats.improvement>=0?'↑':'↓'}
                  </div>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.improvement>=0?'+':''}{stats.improvement.toFixed(1)}%</p>
                <p className="text-purple-100 text-sm">Improvement Trend</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="opacity-80" size={32}/>
                  <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-semibold">Time</div>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.totalHours.toFixed(1)}</p>
                <p className="text-orange-100 text-sm">Hours Practiced</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] border border-white/80 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Activity className="text-indigo-600" size={24}/> Score Distribution
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {pieData.map((entry,index)=> <Cell key={index} fill={COLORS[index%COLORS.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] border border-white/80 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Target className="text-indigo-600" size={24}/> Performance Radar
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb"/>
                    <PolarAngleAxis dataKey="role" style={{ fontSize:'12px'}}/>
                    <PolarRadiusAxis angle={90} domain={[0,100]} style={{ fontSize:'10px'}}/>
                    <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6}/>
                    <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );

      case "trends":
        return (
          <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] border border-white/80 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={24}/> Performance Trend Over Time
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <XAxis 
                  dataKey="fullDateTime" 
                  stroke="#9ca3af" 
                  style={{ fontSize:'11px'}} 
                  angle={-45} textAnchor="end" height={80} 
                  tickFormatter={v=> new Date(v).toLocaleDateString('en-US',{ month:'short', day:'numeric' })}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize:'12px'}} domain={[0,100]}/>
                <Tooltip 
                  contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}
                  formatter={(value, name, props)=> [`Score: ${value}%`,`Role: ${props.payload.role}`]}
                />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{fill:'#6366f1', r:5}} activeDot={{r:7}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case "roles":
        return (
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] border border-white/80 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Target className="text-indigo-600" size={24}/> Average Score by Role
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="role" stroke="#9ca3af" style={{ fontSize:'12px'}}/>
                  <YAxis stroke="#9ca3af" style={{ fontSize:'12px'}} domain={[0,100]}/>
                  <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
                  <Bar dataKey="avgScore" radius={[8,8,0,0]}>
                    {chartData.map((entry,index)=> <Cell key={index} fill={COLORS[index%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {chartData.map((item,index)=>(
                <div key={index} className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_4px_20px_0_rgba(31,38,135,0.05)] p-6 border border-white/80 hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">{item.role}</h3>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length]}}></div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{item.avgScore}%</p>
                  <p className="text-sm text-gray-500">{item.count} sessions completed</p>
                </div>
              ))}
            </div>
          </div>
        );

 case "insights":
        const allStrengths = sessions.flatMap(s => s.strengths || []).filter(str => {
          if (!str || str.trim() === '') return false;
          const lowerStr = str.toLowerCase();
          // Filter out "Not yet generated" placeholder
          if (lowerStr.includes('not yet generated')) return false;
          // Filter out negative strengths (those containing negative words/phrases)
          const negativeIndicators = ['lack of', 'insufficient', 'poor', 'weak', 'unable to', 'struggled with', 'difficulty with', 'failed to', ' not ', 'didn\'t', 'cannot', 'couldn\'t', 'needs improvement', 'requires improvement'];
          return !negativeIndicators.some(indicator => lowerStr.includes(indicator));
        });
        const allImprovements = sessions.flatMap(s => s.improvements || []).filter(imp => {
          if (!imp || imp.trim() === '') return false;
          const lowerImp = imp.toLowerCase();
          return !lowerImp.includes('not yet generated');
        });
        
        const hasStrengths = allStrengths.length > 0;
        const hasImprovements = allImprovements.length > 0;

        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-lg p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Zap size={32}/>
                <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
              </div>
              <p className="text-indigo-100 mb-6">Based on your {stats.totalSessions} interview sessions</p>
            </div> 

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hasStrengths && (
                <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] border border-white/80 rounded-3xl p-8">
                  <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-lg">
                    <Award className="text-green-500" size={24}/> Your Key Strengths
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    {allStrengths.slice(0, 5).map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasImprovements && (
                <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] border border-white/80 rounded-3xl p-8">
                  <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-lg">
                    <Target className="text-orange-500" size={24}/> Crucial Areas to Improve
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    {allImprovements.slice(0, 10).map((improvement, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">→</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!hasStrengths && !hasImprovements && (
                <div className="col-span-2 bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] border border-white/80 rounded-3xl p-12 text-center">
                  <Brain className="mx-auto mb-4 text-gray-400" size={64}/>
                  <h3 className="font-bold text-gray-800 mb-2">No Insights Available Yet</h3>
                  <p className="text-gray-600">Complete more interview sessions to get personalized insights.</p>
                </div>
              )}
            </div>
          </div>
        );

      case "history":
        return (
          <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] border border-white/80 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BookOpen className="text-indigo-600" size={24}/> Complete Session History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Role</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Date & Time</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Score</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Duration</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt)).map((s,i)=>{
                    const start = new Date(s.startedAt);
                    const end = new Date(s.finishedAt);
                    const durationMinutes = ((end-start)/(1000*60)).toFixed(0);
                    return (
                      <tr key={i} className="border-b border-gray-200/50 hover:bg-white/50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">{s.role}</td>
                        <td className="py-4 px-4 text-gray-600 text-sm">
                          <div>{start.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                          <div className="text-xs text-gray-500">{start.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-100 rounded-full h-2 max-w-[100px]">
                              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500" style={{width:`${s.averageScore}%`}}></div>
                            </div>
                            <span className="font-semibold text-gray-900 text-sm">{s.averageScore?.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">{durationMinutes} min</td>
                        
                        <td className="py-4 px-4 text-gray-600 text-sm max-w-xs">
                            {s.showFull ? (
                              <div>{s.feedbackSummary}</div>
                            ) : (
                              <div>{s.feedbackSummary?.slice(0, 100)}...</div>
                            )}
                            {s.feedbackSummary?.length > 100 && (
                              <button
                                className="text-indigo-600 text-xs mt-1 hover:underline"
                                onClick={() => {
                                  const updated = [...sessions];
                                  updated[i].showFull = !updated[i].showFull;
                                  setSessions(updated);
                                }}
                              >
                                {s.showFull ? "Show Less" : "Read More"}
                              </button>
                            )}
                          </td>


                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50">
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white/40 backdrop-blur-3xl border-r border-white/60 p-8 sticky top-0 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Analytics</h2>
            <p className="text-sm text-gray-600">Track your interview performance</p>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = selectedView === item.id;
              return (
                <button key={item.id} onClick={()=>setSelectedView(item.id)} className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 font-medium ${isActive ? `${item.color} text-white shadow-[0_8px_20px_0_rgba(0,0,0,0.1)] transform scale-105` : 'text-gray-700 hover:bg-white/60 hover:shadow-sm'}`}>
                  <Icon size={20}/>
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
                </button>
              )
            })}
          </nav>

          <div className="mt-12 p-6 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-3xl border border-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3"><Zap className="text-indigo-600" size={24}/><h3 className="font-bold text-gray-800">Quick Tip</h3></div>
            <p className="text-sm text-gray-600 leading-relaxed">Practice regularly to see consistent improvement in your interview scores! Analyze your feedback after every session.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-10 overflow-y-auto h-[calc(100vh-64px)]">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{sidebarItems.find(item=>item.id===selectedView)?.label}</h1>
            <p className="text-gray-600">
              {selectedView === "overview" && "Get a complete overview of your interview performance"}
              {selectedView === "trends" && "Analyze how your scores have evolved over time"}
              {selectedView === "roles" && "Compare your performance across different roles"}
              {selectedView === "insights" && "AI-generated insights to help you improve"}
              {selectedView === "history" && "View detailed history of all your interview sessions"}
            </p>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  )
}
