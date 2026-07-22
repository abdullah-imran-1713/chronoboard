export type FocusAlertKind = 'focus' | 'break' | 'countdown'

interface FocusAlertState {
  visible: boolean
  kind: FocusAlertKind
  title: string
  detail: string
}

const alertState = ref<FocusAlertState>({
  visible: false,
  kind: 'focus',
  title: '',
  detail: '',
})

let autoHideTimer: ReturnType<typeof setTimeout> | null = null

function clearAutoHide() {
  if (!autoHideTimer) return
  clearTimeout(autoHideTimer)
  autoHideTimer = null
}

export function useFocusAlert() {
  function show(payload: {
    kind?: FocusAlertKind
    title: string
    detail?: string
    durationMs?: number
  }) {
    clearAutoHide()
    alertState.value = {
      visible: true,
      kind: payload.kind ?? 'focus',
      title: payload.title,
      detail: (payload.detail ?? '').trim(),
    }

    const duration = payload.durationMs ?? 4200
    autoHideTimer = setTimeout(() => {
      dismiss()
    }, duration)
  }

  function showFocusComplete(taskLabel: string, withBreak: boolean) {
    const detail = taskLabel.trim()
    show({
      kind: 'focus',
      title: 'Focus complete',
      detail: detail
        ? (withBreak ? `${detail} — break starting` : detail)
        : (withBreak ? 'Nice work — break starting.' : 'Nice work.'),
      durationMs: 4500,
    })
  }

  function showBreakComplete() {
    show({
      kind: 'break',
      title: 'Break over',
      detail: 'Ready for another focus block?',
      durationMs: 3500,
    })
  }

  function showCountdownComplete() {
    show({
      kind: 'countdown',
      title: 'Countdown finished',
      detail: 'Your target time has been reached.',
      durationMs: 4500,
    })
  }

  function dismiss() {
    clearAutoHide()
    alertState.value = {
      ...alertState.value,
      visible: false,
    }
  }

  return {
    alert: alertState,
    show,
    showFocusComplete,
    showBreakComplete,
    showCountdownComplete,
    dismiss,
  }
}
