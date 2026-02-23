import { Link, Outlet, useLocation } from 'react-router-dom'
export default function Layout() {
  const location = useLocation()
  const navItems = [
    { path: '/', label: '首頁', icon: '🏠' },
    { path: '/clients', label: '客戶管理', icon: '👥' },
    { path: '/reports', label: '報告列表', icon: '📊' },
    { path: '/reports/new', label: '建立報告', icon: '➕' },
  ]
  return (
    <div className="min-h-screen bg-gray-900 flex">
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">📈 AdReport</h1>
          <p className="text-sm text-gray-400 mt-1">廣告報告系統</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">v1.0.0 · Made with ❤️</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8"><Outlet /></div>
      </main>
    </div>
  )
}
