import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
export default function PublicReport() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => { fetchReport() }, [id])
  const fetchReport = async () => {
    try {
      const { data, error } = await supabase.from('reports').select('*, clients(name, industry)').eq('id', id).single()
      if (error) throw error
      setReport(data)
    } catch (error) { setError('找不到報告') } finally { setLoading(false) }
  }
  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-500">載入中...</div></div>
  if (error || !report) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">📊</div><h1 className="text-2xl font-bold text-gray-800 mb-2">找不到報告</h1></div></div>
  return (
    <div className="min-h-screen bg-white public-report">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2">📊 {report.clients?.name || '廣告'} 成效報告</h1>
          <p className="text-blue-100">{report.clients?.industry ? `${report.clients.industry} · ` : ''}{new Date(report.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{report.data_analysis || '（無內容）'}</ReactMarkdown></div>
      </main>
      <footer className="border-t border-gray-200 mt-12 py-6">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>此報告由 AdReport 系統生成</p>
          <p className="mt-1">如有任何問題，請聯繫智慧媽咪國際有限公司</p>
        </div>
      </footer>
    </div>
  )
}
