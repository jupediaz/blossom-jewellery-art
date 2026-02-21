'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { EnhanceMode } from './EnhanceMode'
import { SceneMode } from './SceneMode'
import { ComposeMode } from './ComposeMode'

const tabs = [
  { id: 'enhance', label: 'Product Enhancement' },
  { id: 'scene', label: 'Scene Generator' },
  { id: 'compose', label: 'Full Composition' },
] as const

type TabId = (typeof tabs)[number]['id']

export function StudioTabs() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('mode') as TabId) || 'enhance'
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)

  return (
    <div className="space-y-6">
      {/* Tab buttons */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-charcoal text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {activeTab === 'enhance' && <EnhanceMode />}
        {activeTab === 'scene' && <SceneMode />}
        {activeTab === 'compose' && <ComposeMode />}
      </div>
    </div>
  )
}
