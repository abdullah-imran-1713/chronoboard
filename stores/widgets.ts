import { defineStore } from 'pinia'
import type { WidgetDefinition, WidgetCategory } from '../types/widget'

// ============================================
// WIDGET REGISTRY — Add new widgets HERE only
// ============================================
export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    id: 'world-clock',
    name: 'World Clock',
    description: 'Show time in multiple timezones',
    icon: 'mdi:earth',
    component: 'WorldClockWidget',
    defaultEnabled: false,
    category: 'time',
  },
  {
    id: 'pomodoro',
    name: 'Focus',
    description: 'Custom focus timer with breaks',
    icon: 'mdi:timer-outline',
    component: 'PomodoroWidget',
    defaultEnabled: false,
    category: 'productivity',
  },
  {
    id: 'stopwatch',
    name: 'Stopwatch',
    description: 'Simple stopwatch',
    icon: 'mdi:timer',
    component: 'StopwatchWidget',
    defaultEnabled: false,
    category: 'productivity',
  },
  {
    id: 'countdown',
    name: 'Countdown',
    description: 'Countdown to a specific date or time',
    icon: 'mdi:clock-end',
    component: 'CountdownWidget',
    defaultEnabled: false,
    category: 'productivity',
  },
  {
    id: 'notes',
    name: 'Quick Notes',
    description: 'Sticky notes on your dashboard',
    icon: 'mdi:note-text',
    component: 'NotesWidget',
    defaultEnabled: false,
    category: 'productivity',
  },
  {
    id: 'weather',
    name: 'Weather',
    description: 'Current weather for your location',
    icon: 'mdi:weather-partly-cloudy',
    component: 'WeatherWidget',
    defaultEnabled: false,
    category: 'info',
  },
  {
    id: 'day-progress',
    name: 'Day Progress',
    description: 'How much of the day has passed',
    icon: 'mdi:progress-clock',
    component: 'ProgressWidget',
    defaultEnabled: false,
    category: 'info',
  },
  {
    id: 'quote',
    name: 'Quote of the Day',
    description: 'Daily inspirational quote',
    icon: 'mdi:format-quote-close',
    component: 'QuoteWidget',
    defaultEnabled: false,
    category: 'info',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Mini monthly calendar view',
    icon: 'mdi:calendar',
    component: 'CalendarWidget',
    defaultEnabled: false,
    category: 'info',
  },
  {
    id: 'prayer-times',
    name: 'Prayer Times',
    description: 'Full daily prayer schedule with countdown',
    icon: 'mdi:mosque',
    component: 'PrayerTimesWidget',
    defaultEnabled: false,
    category: 'religious',
  },
  {
    id: 'next-prayer',
    name: 'Next Prayer',
    description: 'Next prayer time and countdown',
    icon: 'mdi:mosque',
    component: 'NextPrayerWidget',
    defaultEnabled: false,
    category: 'religious',
  },
  {
    id: 'quran-verse',
    name: 'Quran Verse',
    description: 'Daily Quran verse with translation',
    icon: 'mdi:book-open-variant',
    component: 'QuranVerseWidget',
    defaultEnabled: false,
    category: 'religious',
  },
  {
    id: 'battery',
    name: 'Battery',
    description: 'Device battery level',
    icon: 'mdi:battery',
    component: 'BatteryWidget',
    defaultEnabled: false,
    category: 'system',
  },
  {
    id: 'connection',
    name: 'Connection Status',
    description: 'Internet connection indicator',
    icon: 'mdi:wifi',
    component: 'ConnectionStatusWidget',
    defaultEnabled: false,
    category: 'system',
  },
]

export const useWidgetStore = defineStore('widgets', {
  state: () => ({
    enabledWidgets: [] as string[],
  }),

  getters: {
    activeWidgets(state): WidgetDefinition[] {
      return WIDGET_REGISTRY.filter(w => state.enabledWidgets.includes(w.id))
    },

    widgetsByCategory(): Record<WidgetCategory, WidgetDefinition[]> {
      const categories: Record<WidgetCategory, WidgetDefinition[]> = {
        time: [],
        productivity: [],
        info: [],
        religious: [],
        system: [],
      }
      for (const widget of WIDGET_REGISTRY) {
        categories[widget.category].push(widget)
      }
      return categories
    },

    isEnabled: (state) => {
      return (id: string): boolean => state.enabledWidgets.includes(id)
    },
  },

  actions: {
    setWidgetEnabled(id: string, enabled: boolean) {
      const index = this.enabledWidgets.indexOf(id)
      if (enabled && index === -1) {
        this.enabledWidgets.push(id)
      } else if (!enabled && index !== -1) {
        this.enabledWidgets.splice(index, 1)
      }
    },

    toggleWidget(id: string) {
      this.setWidgetEnabled(id, !this.isEnabled(id))
    },
  },
})
