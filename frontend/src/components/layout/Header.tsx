import { Bell, Wallet } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-white">Welcome back 👋</h1>
        <p className="text-sm text-gray-400">Blockchain made simple, safe, and smart.</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-secondary flex items-center gap-2 text-sm">
          <Wallet size={16} />
          Connect Wallet
        </button>
        <button className="relative p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
          <Bell size={18} className="text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
