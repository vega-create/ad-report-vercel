import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetchClients() }, [])
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setClients(data || [])
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }
  const deleteClient = async (id, name) => {
    if (!confirm(`確定要刪除客戶「${name}」嗎？`)) return
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
      setClients(clients.filter(c => c.id !== id))
    } catch (error) { alert('刪除失敗') }
  }
  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">載入中...</div></div>
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">👥 客戶管理</h1>
        <Link to="/clients/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">➕ 新增客戶</Link>
      </div>
      {clients.length > 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900"><tr><th className="px-6 py-4 text-left text-gray-400">客戶名稱</th><th className="px-6 py-4 text-left text-gray-400">產業</th><th className="px-6 py-4 text-left text-gray-400">LINE 群組</th><th className="px-6 py-4 text-left text-gray-400">建立時間</th><th className="px-6 py-4 text-right text-gray-400">操作</th></tr></thead>
            <tbody className="divide-y divide-gray-700">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 text-white font-medium">{client.name}</td>
                  <td className="px-6 py-4 text-gray-300">{client.industry || '-'}</td>
                  <td className="px-6 py-4">{client.line_group_id ? <span className="text-green-400">✓ 已設定</span> : <span className="text-gray-500">未設定</span>}</td>
                  <td className="px-6 py-4 text-gray-400">{new Date(client.created_at).toLocaleDateString('zh-TW')}</td>
                  <td className="px-6 py-4 text-right"><Link to={`/clients/${client.id}/edit`} className="text-blue-400 hover:text-blue-300 mr-4">編輯</Link><button onClick={() => deleteClient(client.id, client.name)} className="text-red-400 hover:text-red-300">刪除</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <div className="text-5xl mb-4">👤</div>
          <h3 className="text-xl text-white mb-2">還沒有任何客戶</h3>
          <Link to="/clients/new" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">➕ 新增客戶</Link>
        </div>
      )}
    </div>
  )
}
