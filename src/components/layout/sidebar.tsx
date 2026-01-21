'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  Building2,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Bus,
  Library,
  Sparkles,
  History,
  Lock,
  Gift,
  UserCog,
  ClipboardCheck,
  Award,
  School,
  MessageSquare,
  Calendar,
  ChevronDown,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  module?: 'hostel' | 'transport' | 'library' | 'sms'
  adminOnly?: boolean
  requiresTier?: 'standard' | 'premium'
  tourId?: string
  isLocked?: boolean
}

interface NavGroup {
  id: string
  label: string
  items: NavItem[]
  defaultExpanded?: boolean
}

// Define navigation groups for Institution sidebar
const centerNavGroups: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    defaultExpanded: true,
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, tourId: 'sidebar-dashboard' },
    ],
  },
  {
    id: 'people',
    label: 'People',
    defaultExpanded: false,
    items: [
      { label: 'Students', href: '/dashboard/students', icon: <GraduationCap className="w-5 h-5" />, tourId: 'sidebar-students' },
      { label: 'Teachers', href: '/dashboard/teachers', icon: <Users className="w-5 h-5" />, adminOnly: true },
      { label: 'Staff', href: '/dashboard/staff', icon: <UserCog className="w-5 h-5" />, adminOnly: true },
    ],
  },
  {
    id: 'academic',
    label: 'Academic',
    defaultExpanded: false,
    items: [
      { label: 'Subjects', href: '/dashboard/subjects', icon: <BookOpen className="w-5 h-5" />, tourId: 'sidebar-subjects' },
      { label: 'Attendance', href: '/dashboard/attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
      { label: 'Grades', href: '/dashboard/grades', icon: <Award className="w-5 h-5" /> },
      { label: 'Report Cards', href: '/dashboard/report-cards', icon: <FileText className="w-5 h-5" /> },
      { label: 'Classes', href: '/dashboard/classes', icon: <School className="w-5 h-5" /> },
      { label: 'Timetable', href: '/dashboard/timetable', icon: <Calendar className="w-5 h-5" /> },
    ],
  },
  {
    id: 'financial',
    label: 'Financial',
    defaultExpanded: false,
    items: [
      { label: 'Payments', href: '/dashboard/payments', icon: <CreditCard className="w-5 h-5" />, tourId: 'sidebar-payments' },
    ],
  },
  {
    id: 'modules',
    label: 'Modules',
    defaultExpanded: false,
    items: [
      { label: 'SMS Campaigns', href: '/dashboard/sms', icon: <MessageSquare className="w-5 h-5" />, module: 'sms', requiresTier: 'standard' },
      { label: 'Hostel', href: '/dashboard/hostel', icon: <Home className="w-5 h-5" />, module: 'hostel', requiresTier: 'premium' },
      { label: 'Transport', href: '/dashboard/transport', icon: <Bus className="w-5 h-5" />, module: 'transport', requiresTier: 'premium' },
      { label: 'Library', href: '/dashboard/library', icon: <Library className="w-5 h-5" />, module: 'library', requiresTier: 'standard' },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    defaultExpanded: false,
    items: [
      { label: 'Reports', href: '/dashboard/reports', icon: <FileText className="w-5 h-5" />, adminOnly: true, tourId: 'sidebar-reports' },
      { label: 'Audit Logs', href: '/dashboard/audit-logs', icon: <History className="w-5 h-5" />, adminOnly: true },
      { label: 'Referrals', href: '/dashboard/referrals', icon: <Gift className="w-5 h-5" />, adminOnly: true },
      { label: 'Subscription', href: '/dashboard/subscription', icon: <Sparkles className="w-5 h-5" />, adminOnly: true },
      { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="w-5 h-5" />, adminOnly: true, tourId: 'sidebar-settings' },
    ],
  },
]

// Define navigation groups for Super Admin sidebar
const adminNavGroups: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    defaultExpanded: true,
    items: [
      { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    defaultExpanded: false,
    items: [
      { label: 'Clients', href: '/admin/clients', icon: <FileText className="w-5 h-5" /> },
      { label: 'Tutorial Centers', href: '/admin/centers', icon: <Building2 className="w-5 h-5" /> },
      { label: 'All Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    defaultExpanded: false,
    items: [
      { label: 'Reports', href: '/admin/reports', icon: <FileText className="w-5 h-5" /> },
      { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
    ],
  },
]

const STORAGE_KEY_CENTER = 'sidebar-expanded-groups'
const STORAGE_KEY_ADMIN = 'admin-sidebar-expanded-groups'

// Mobile Header Component
export function MobileHeader({ onMenuClick, title }: { onMenuClick: () => void; title?: string }) {
  const { user } = useAuthStore()
  const primaryColor = user?.center?.primary_color || '#1E40AF'
  const centerName = user?.center?.name || title || 'School Management'
  const logoUrl = user?.center?.logo_url

  return (
    <header
      className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-40"
    >
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600"
      >
        <Menu className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-3 ml-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={centerName}
            className="w-8 h-8 rounded-lg bg-gray-100 p-0.5 object-contain"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            {centerName.charAt(0)}
          </div>
        )}
        <span className="font-semibold text-gray-900 truncate">{centerName}</span>
      </div>
    </header>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut, canAccessModule, isCenterAdmin, getSubscriptionTier } = useAuthStore()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [lockedModule, setLockedModule] = useState<{ module: string; tier: 'standard' | 'premium' } | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['overview']))

  // Load expanded state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CENTER)
      if (saved) {
        setExpandedGroups(new Set(JSON.parse(saved)))
      } else {
        // Default: only overview expanded
        setExpandedGroups(new Set(['overview']))
      }
    } catch {
      setExpandedGroups(new Set(['overview']))
    }
  }, [])

  // Save expanded state to localStorage
  const saveExpandedState = useCallback((groups: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY_CENTER, JSON.stringify([...groups]))
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Auto-expand group when navigating to an item inside it
  useEffect(() => {
    const processedGroups = getProcessedGroups()
    for (const group of processedGroups) {
      const hasActiveItem = group.items.some(item => {
        if (item.href === '/dashboard') {
          return pathname === '/dashboard'
        }
        return pathname === item.href || pathname.startsWith(item.href + '/')
      })
      if (hasActiveItem && !expandedGroups.has(group.id)) {
        const newExpanded = new Set(expandedGroups)
        newExpanded.add(group.id)
        setExpandedGroups(newExpanded)
        saveExpandedState(newExpanded)
        break
      }
    }
  }, [pathname])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const currentTier = getSubscriptionTier()
  const tierHierarchy = { micro: 1, starter: 2, standard: 3, premium: 4 }
  const currentTierLevel = tierHierarchy[currentTier] || 2

  // Process groups: filter items and mark locked ones
  const getProcessedGroups = useCallback(() => {
    return centerNavGroups.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (item.adminOnly && !isCenterAdmin()) return false
        return true
      }).map(item => {
        if (item.module && item.requiresTier) {
          const requiredLevel = tierHierarchy[item.requiresTier] || 4
          const isLocked = currentTierLevel < requiredLevel
          const hasAccess = canAccessModule(item.module)
          return { ...item, isLocked: isLocked || !hasAccess }
        }
        return { ...item, isLocked: false }
      })
    })).filter(group => group.items.length > 0)
  }, [currentTierLevel, isCenterAdmin, canAccessModule])

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
    saveExpandedState(newExpanded)
  }

  const primaryColor = user?.center?.primary_color || '#1E40AF'
  const centerName = user?.center?.name || 'Tutorial Center'
  const logoUrl = user?.center?.logo_url
  const processedGroups = getProcessedGroups()

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Logo Area */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            logoUrl.includes('127.0.0.1') || logoUrl.includes('localhost') ? (
              <img
                src={logoUrl}
                alt={centerName}
                className="rounded-lg bg-gray-100 p-1 object-contain w-10 h-10 flex-shrink-0"
              />
            ) : (
              <Image
                src={logoUrl}
                alt={centerName}
                width={40}
                height={40}
                className="rounded-lg bg-gray-100 p-1 object-contain flex-shrink-0"
              />
            )
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              {centerName.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
              {centerName}
            </h2>
          </div>
          {mobile && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {processedGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.id)
          const hasActiveItem = group.items.some(item => {
            if (item.href === '/dashboard') {
              return pathname === '/dashboard'
            }
            return pathname === item.href || pathname.startsWith(item.href + '/')
          })

          return (
            <div key={group.id} className="mb-2">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                  hasActiveItem
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{group.label}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>

              {/* Group Items */}
              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="mt-1 space-y-0.5 pl-2">
                  {group.items.map((item) => {
                    const isActive = item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname === item.href || pathname.startsWith(item.href + '/')

                    if (item.isLocked) {
                      return (
                        <button
                          key={item.href}
                          onClick={() => setLockedModule({ module: item.label, tier: item.requiresTier || 'premium' })}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          {item.icon}
                          <span className="font-medium flex-1 text-left text-sm">{item.label}</span>
                          <Lock className="w-4 h-4" />
                        </button>
                      )
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        data-tour={item.tourId}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        style={isActive ? { backgroundColor: primaryColor } : undefined}
                      >
                        {item.icon}
                        <span className="font-medium text-sm">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </nav>

      {/* Locked Module Modal */}
      {lockedModule && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
              lockedModule.tier === 'premium' ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              <Lock className={`w-7 h-7 ${
                lockedModule.tier === 'premium' ? 'text-purple-600' : 'text-blue-600'
              }`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {lockedModule.module} is Locked
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              This feature requires the{' '}
              <span className={`font-semibold ${
                lockedModule.tier === 'premium' ? 'text-purple-600' : 'text-blue-600'
              }`}>
                {lockedModule.tier.charAt(0).toUpperCase() + lockedModule.tier.slice(1)}
              </span>{' '}
              plan or higher.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setLockedModule(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Maybe Later
              </button>
              <Link
                href="/dashboard/subscription"
                onClick={() => setLockedModule(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate text-sm">{user?.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full border border-gray-200 hover:border-red-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setIsMobileOpen(true)} />

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <NavContent mobile />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex-col z-30">
        <NavContent />
      </aside>
    </>
  )
}

// Mobile Header for Admin
export function AdminMobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 z-40">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-800 text-gray-400"
      >
        <Menu className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-3 ml-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          SA
        </div>
        <span className="font-semibold text-white">Super Admin</span>
      </div>
    </header>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuthStore()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['overview']))

  // Load expanded state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADMIN)
      if (saved) {
        setExpandedGroups(new Set(JSON.parse(saved)))
      } else {
        setExpandedGroups(new Set(['overview']))
      }
    } catch {
      setExpandedGroups(new Set(['overview']))
    }
  }, [])

  // Save expanded state to localStorage
  const saveExpandedState = useCallback((groups: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify([...groups]))
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Auto-expand group when navigating to an item inside it
  useEffect(() => {
    for (const group of adminNavGroups) {
      const hasActiveItem = group.items.some(item => {
        if (item.href === '/admin') {
          return pathname === '/admin'
        }
        return pathname === item.href || pathname.startsWith(item.href + '/')
      })
      if (hasActiveItem && !expandedGroups.has(group.id)) {
        const newExpanded = new Set(expandedGroups)
        newExpanded.add(group.id)
        setExpandedGroups(newExpanded)
        saveExpandedState(newExpanded)
        break
      }
    }
  }, [pathname])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
    saveExpandedState(newExpanded)
  }

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            SA
          </div>
          <span className="font-semibold text-white">Super Admin</span>
        </div>
        {mobile && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {adminNavGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.id)
          const hasActiveItem = group.items.some(item => {
            if (item.href === '/admin') {
              return pathname === '/admin'
            }
            return pathname === item.href || pathname.startsWith(item.href + '/')
          })

          return (
            <div key={group.id} className="mb-2">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                  hasActiveItem
                    ? 'text-white bg-gray-800'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                <span>{group.label}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>

              {/* Group Items */}
              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="mt-1 space-y-0.5 pl-2">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {item.icon}
                        <span className="font-medium text-sm">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-white truncate text-sm">{user?.full_name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-red-600/10 hover:text-red-400 transition-colors w-full border border-gray-700 hover:border-red-600/50"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <AdminMobileHeader onMenuClick={() => setIsMobileOpen(true)} />

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <NavContent mobile />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 bg-gray-900 flex-col z-30">
        <NavContent />
      </aside>
    </>
  )
}
