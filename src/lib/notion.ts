import { Client } from '@notionhq/client'

const globalForNotion = globalThis as unknown as {
  notion: Client | undefined
}

export const notion =
  globalForNotion.notion ??
  new Client({ auth: process.env.NOTION_API_KEY })

if (process.env.NODE_ENV !== 'production') globalForNotion.notion = notion

// Notion database IDs from environment
export const NOTION_DBS = {
  roadmap: process.env.NOTION_ROADMAP_DB_ID ?? '',
  tasks: process.env.NOTION_TASKS_DB_ID ?? '',
  products: process.env.NOTION_PRODUCTS_DB_ID ?? '',
} as const

export async function createTask({
  title,
  phase,
  assignee,
  priority = 'Medium',
  type = 'Development',
  effort = 'M',
  dueDate,
  notes,
}: {
  title: string
  phase?: string
  assignee?: string
  priority?: 'Critical' | 'High' | 'Medium' | 'Low'
  type?: 'Development' | 'Design' | 'Content' | 'Research' | 'Config'
  effort?: 'XS' | 'S' | 'M' | 'L' | 'XL'
  dueDate?: string
  notes?: string
}) {
  if (!NOTION_DBS.tasks) {
    console.warn('[Notion] NOTION_TASKS_DB_ID not set, skipping task creation')
    return null
  }

  const properties: Record<string, unknown> = {
    Task: { title: [{ text: { content: title } }] },
    Status: { select: { name: 'Todo' } },
    Priority: { select: { name: priority } },
    Type: { select: { name: type } },
    Effort: { select: { name: effort } },
  }

  if (dueDate) {
    properties['Due Date'] = { date: { start: dueDate } }
  }

  const children = notes
    ? [
        {
          object: 'block' as const,
          type: 'paragraph' as const,
          paragraph: {
            rich_text: [{ type: 'text' as const, text: { content: notes } }],
          },
        },
      ]
    : undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return notion.pages.create({
    parent: { database_id: NOTION_DBS.tasks },
    properties: properties as any,
    children,
  })
}

export async function updateRoadmapPhase({
  pageId,
  status,
  progress,
}: {
  pageId: string
  status?: 'Not Started' | 'In Progress' | 'Complete'
  progress?: number
}) {
  const properties: Record<string, unknown> = {}

  if (status) {
    properties.Status = { select: { name: status } }
  }
  if (progress !== undefined) {
    properties.Progress = { number: progress }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return notion.pages.update({
    page_id: pageId,
    properties: properties as any,
  })
}
