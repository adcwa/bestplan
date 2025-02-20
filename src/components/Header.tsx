'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface Props {
  onOpenCommandPalette: () => void
}

export const Header: React.FC<Props> = ({ onOpenCommandPalette }) => {
  const { user, profile, signOut } = useAuth()

  return (
    <header className="flex justify-between items-center py-4 px-6 bg-white border-b border-neutral-200">
      <div className="flex-1">
        <button
          onClick={onOpenCommandPalette}
          className="p-2 text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
          title="搜索 (⌘K)"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={onOpenCommandPalette}
        className="flex items-center group focus:outline-none"
      >
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
          The Best Year of My Life
        </h1>
      </button>

      <div className="flex-1 flex justify-end">
        {user && (
          <Menu as="div" className="relative">
            <Menu.Button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {profile?.avatar_url ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={profile.avatar_url}
                  alt={profile.full_name || '用户头像'}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-medium">
                    {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/profile"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      个人信息
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/settings"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      设置
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={signOut}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      退出
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
    </header>
  )
} 