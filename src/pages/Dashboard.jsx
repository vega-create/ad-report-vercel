import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, reports: 0, recentReports: [] })
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetchStats() }, [])
  const fetchStats = async () => {
    try {
      const { count: clientCount } = await supabase.from('clients').select('*', { count: 'exact', head: true })
      const { count: reportCount } = await supabase.from('reports').select('*', { count: 'exact', head: true })
      const { data: recentReports } = await supabase.from('reports').select('*, clients(name)').order('created_at', { ascending: false }).limit(5)
      setStats({ clients: clientCount || 0, reports: reportCount || 0, recentReports: recentReports || [] })
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }
  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">載入中...</div></div>
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">📈 儀表板</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700"><div className="text-3xl mb-2">👥</div><div className="text-3xl font-bold text-white">{stats.clients}</div><div className="text-gray-400">客戶總數</div></div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700"><div className="text-3xl mb-2">📊</div><div className="text-3xl font-bold text-white">{stats.reports}</div><div className="text-gray-400">報告總數</div></div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700"><div className="text-3xl mb-2">✨</div><div className="text-3xl font-bold text-white">{stats.recentReports.filter(r => r.status === 'published').length}</div><div className="text-gray-400">已發布報告</div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/reports/new" className="bg-blue-600 hover:bg-blue-700 rounded-xl p-6 text-center transition-colors"><div className="text-4xl mb-3">➕</div><div className="text-xl font-bold text-white">建立新報告</div><div className="text-blue-200 mt-1">上傳截圖，AI 自動生成報告</div></Link>
        <Link to="/clients/new" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-center border border-gray-700 transition-colors"><div className="text-4xl mb-3">👤</div><div className="text-xl font-bold text-white">新增客戶</div><div className="text-gray-400 mt-1">設定客戶資料與 LINE 群組</div></Link>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700"><h2 className="text-lg font-bold text-white">📝 最近報告</h2></div>
        {stats.recentReports.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {stats.recentReports.map((report) => (
              <Link key={report.id} to={`/reports/${report.id}`} className="block p-4 hover:bg-gray-700 transition-colors">
                <div className="flex justify-between items-center">
                  <div><div className="text-white font-medium">{report.clients?.name || '未知客戶'}</div><div className="text-sm text-gray-400">{new Date(report.created_at).toLocaleDateString('zh-TW')}</div></div>
                  <span className={`px-3 py-1 rounded-full text-xs ${report.status === 'published' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{report.status === 'published' ? '已發布' : '草稿'}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : <div className="p-8 text-center text-gray-500">還沒有任何報告</div>}
      </div>
    </div>
  )
}
