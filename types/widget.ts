export interface WidgetDefinition {
  id: string
  name: string
  description: string
  icon: string
  component: string
  defaultEnabled: boolean
  category: WidgetCategory
}

export type WidgetCategory =
  | 'time'
  | 'productivity'
  | 'info'
  | 'religious'
  | 'system'

export interface WidgetState {
  enabledWidgets: string[]
}
