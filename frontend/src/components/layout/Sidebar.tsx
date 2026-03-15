import { NavLink } from 'react-router-dom'
import { BookOpen, BarChart2, Shield, MessageSquare, LayoutDashboard } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/education',   icon: BookOpen,         label: 'Education'    },
  { to: '/analytics',   icon: BarChart2,        label: 'Analytics'    },
  { to: '/nft-scanner', icon: Shield,           label: 'NFT Scanner'  },
  { to: '/chat',        icon: MessageSquare,    label: 'AI Chat'      },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">ChainGuard</p>
            <p className="text-primary-500 text-xs font-semibold">AI Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">ChainGuard AI v1.0.0</p>
      </div>
    </aside>
  )
}
