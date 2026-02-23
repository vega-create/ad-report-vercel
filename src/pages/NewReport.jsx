import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ImageStitcher from '../components/ImageStitcher'

export default function NewReport() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState('')
  const [screenshots, setScreenshots] = useState([])
  const [notes, setNotes] = useState('')
  const [generating, setGenerating] = useState(false)
  const [showStitcher, setShowStitcher] = useState(false)
  const [csvData, setCsvData] = useState('')
  const [csvFileName, setCsvFileName] = useState('')

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from('clients').select('*').order('name')
      if (error) throw error
      setClients(data || [])
    } catch (error) { console.error(error) }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setScreenshots(prev => {
          if (prev.length >= 5) { alert('最多只能上傳 5 張圖片'); return prev }
          return [...prev, event.target.result]
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleCsvSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      alert('請上傳 CSV 格式的檔案')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setCsvData(event.target.result)
      setCsvFileName(file.name)
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleStitchedImage = (stitchedDataUrl) => {
    setScreenshots(prev => {
      if (prev.length >= 5) { alert('最多只能上傳 5 張圖片'); return prev }
      return [...prev, stitchedDataUrl]
    })
  }

  const generateReport = async () => {
    if (!selectedClient) { alert('請選擇客戶'); return }
    if (screenshots.length === 0 && !csvData) { alert('請上傳至少一張截圖或一個 CSV 檔案'); return }
    setGenerating(true)
    try {
      const client = clients.find(c => c.id === selectedClient)
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshots,
          clientInfo: { name: client?.name, industry: client?.industry },
          notes,
          csvData: csvData || null,
          csvFileName: csvFileName || null
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '生成失敗')
      const { data: report, error } = await supabase.from('reports').insert([{
        client_id: selectedClient,
        data_analysis: data.report.data_analysis,
        report_date: new Date().toISOString().split('T')[0],
        status: 'draft'
      }]).select().single()
      if (error) throw error
      navigate(`/reports/${report.id}`)
    } catch (error) { alert('生成失敗: ' + error.message) } finally { setGenerating(false) }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-8">➕ 建立新報告</h1>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">

        {/* 選擇客戶 */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">選擇客戶 <span className="text-red-400">*</span></label>
          <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
            <option value="">請選擇客戶...</option>
            {clients.map((client) => (<option key={client.id} value={client.id}>{client.name} {client.industry ? `(${client.industry})` : ''}</option>))}
          </select>
        </div>

        {/* 上傳截圖 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-300">上傳廣告截圖（最多 5 張）</label>
            <button type="button" onClick={() => setShowStitcher(true)} className="text-blue-400 hover:text-blue-300 text-sm">📸 拼接多張截圖</button>
          </div>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <label className="cursor-pointer">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-gray-300 mb-1">選擇圖片檔案</div>
              <div className="text-gray-500 text-sm">PNG、JPG</div>
              <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
            </label>
          </div>
          {screenshots.length > 0 && (
            <div className="mt-4 flex gap-4 flex-wrap">
              {screenshots.map((src, index) => (
                <div key={index} className="relative">
                  <img src={src} alt={`截圖 ${index + 1}`} className="h-32 rounded-lg border border-gray-600" />
                  <button onClick={() => setScreenshots(prev => prev.filter((_, i) => i !== index))} className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-sm hover:bg-red-700">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 上傳 CSV */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">上傳 CSV 數據（選填）</label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${csvData ? 'border-green-500 bg-green-900/20' : 'border-gray-600 hover:border-blue-500'}`}>
            <label className="cursor-pointer">
              {csvData ? (
                <div>
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-green-400 font-medium">{csvFileName}</div>
                  <div className="text-gray-500 text-sm mt-1">CSV 已載入，將與截圖一起分析</div>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-gray-300 mb-1">選擇 CSV 檔案</div>
                  <div className="text-gray-500 text-sm">支援 Meta 廣告報告、GA4 匯出等 CSV 格式</div>
                </div>
              )}
              <input type="file" accept=".csv" onChange={handleCsvSelect} className="hidden" />
            </label>
          </div>
          {csvData && (
            <button onClick={() => { setCsvData(''); setCsvFileName('') }} className="mt-2 text-red-400 hover:text-red-300 text-sm">
              × 移除 CSV
            </button>
          )}
          <p className="text-gray-500 text-sm mt-2">💡 上傳 CSV 可以讓 AI 讀取完整的數字數據，分析更精準</p>
        </div>

        {/* 補充說明 */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">補充說明（選填）</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none" placeholder="例如：本週有做促銷活動、過年期間廣告停播..." />
        </div>

        {/* 生成按鈕 */}
        <button onClick={generateReport} disabled={generating || !selectedClient || (screenshots.length === 0 && !csvData)} className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-lg">
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              AI 正在分析中...（最多 60 秒）
            </span>
          ) : '🚀 生成報告'}
        </button>
      </div>
      {showStitcher && <ImageStitcher onStitched={handleStitchedImage} onClose={() => setShowStitcher(false)} />}
    </div>
  )
}
