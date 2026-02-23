import { useState, useRef } from 'react'
export default function ImageStitcher({ onStitched, onClose }) {
  const [images, setImages] = useState([])
  const [stitching, setStitching] = useState(false)
  const [direction, setDirection] = useState('vertical')
  const canvasRef = useRef(null)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => { setImages(prev => [...prev, { src: event.target.result, width: img.width, height: img.height, element: img }]) }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    })
  }
  const moveImage = (index, dir) => {
    setImages(prev => {
      const newImages = [...prev]
      const newIndex = dir === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= newImages.length) return prev
      ;[newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
      return newImages
    })
  }
  const stitchImages = async () => {
    if (images.length < 2) { alert('請至少選擇 2 張圖片'); return }
    setStitching(true)
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (direction === 'vertical') {
        canvas.width = Math.max(...images.map(img => img.width))
        canvas.height = images.reduce((sum, img) => sum + img.height, 0)
        let currentY = 0
        for (const img of images) { ctx.drawImage(img.element, (canvas.width - img.width) / 2, currentY); currentY += img.height }
      } else {
        canvas.width = images.reduce((sum, img) => sum + img.width, 0)
        canvas.height = Math.max(...images.map(img => img.height))
        let currentX = 0
        for (const img of images) { ctx.drawImage(img.element, currentX, (canvas.height - img.height) / 2); currentX += img.width }
      }
      onStitched(canvas.toDataURL('image/png'))
      onClose()
    } catch (error) { alert('拼接失敗，請重試') } finally { setStitching(false) }
  }
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">拼接多張截圖</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <label className="block">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer">
                <div className="text-gray-300">點擊選擇圖片</div>
                <div className="text-gray-500 text-sm mt-1">支援 PNG、JPG</div>
              </div>
              <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
            </label>
          </div>
          <div className="mb-6 flex gap-4">
            <button onClick={() => setDirection('vertical')} className={`px-4 py-2 rounded-lg ${direction === 'vertical' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>垂直拼接</button>
            <button onClick={() => setDirection('horizontal')} className={`px-4 py-2 rounded-lg ${direction === 'horizontal' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>水平拼接</button>
          </div>
          {images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-gray-300 mb-3">已選擇 {images.length} 張圖片：</h3>
              <div className="flex flex-col gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative bg-gray-700 rounded-lg p-2 flex items-center gap-3">
                    <img src={img.src} alt={`圖片 ${index + 1}`} className="h-20 object-contain rounded" />
                    <div className="flex gap-1">
                      <button onClick={() => moveImage(index, 'up')} disabled={index === 0} className="text-xs px-2 py-1 bg-gray-600 rounded disabled:opacity-50">↑</button>
                      <button onClick={() => moveImage(index, 'down')} disabled={index === images.length - 1} className="text-xs px-2 py-1 bg-gray-600 rounded disabled:opacity-50">↓</button>
                      <button onClick={() => setImages(prev => prev.filter((_, i) => i !== index))} className="text-xs px-2 py-1 bg-red-600 rounded">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="flex gap-4 justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg">取消</button>
            <button onClick={stitchImages} disabled={images.length < 2 || stitching} className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
              {stitching ? '拼接中...' : `拼接 ${images.length} 張圖片`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
