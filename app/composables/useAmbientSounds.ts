import { AMBIENT_SOUNDS } from '../../utils/widgets'

interface SoundState {
  playing: boolean
  volume: number
}

export function useAmbientSounds() {
  const states = ref<Record<string, SoundState>>(
    Object.fromEntries(
      AMBIENT_SOUNDS.map(s => [s.id, { playing: false, volume: 0.5 }]),
    ),
  )

  const audioMap = new Map<string, HTMLAudioElement>()

  function getAudio(soundId: string, file: string): HTMLAudioElement {
    let audio = audioMap.get(soundId)
    if (!audio) {
      audio = new Audio(file)
      audio.loop = true
      audioMap.set(soundId, audio)
    }
    return audio
  }

  function toggle(soundId: string, file: string) {
    if (!import.meta.client) return

    const audio = getAudio(soundId, file)
    const state = states.value[soundId]!
    audio.volume = state.volume

    if (state.playing) {
      audio.pause()
      states.value[soundId] = { ...state, playing: false }
    } else {
      audio.play().catch(() => {
        states.value[soundId] = { ...state, playing: false }
      })
      states.value[soundId] = { ...state, playing: true }
    }
  }

  function setVolume(soundId: string, file: string, volume: number) {
    const state = states.value[soundId]!
    states.value[soundId] = { ...state, volume }
    const audio = audioMap.get(soundId)
    if (audio) {
      audio.volume = volume
    } else if (state.playing) {
      const newAudio = getAudio(soundId, file)
      newAudio.volume = volume
    }
  }

  function stopAll() {
    for (const audio of audioMap.values()) {
      audio.pause()
      audio.currentTime = 0
    }
    states.value = Object.fromEntries(
      AMBIENT_SOUNDS.map(s => [s.id, { playing: false, volume: states.value[s.id]?.volume ?? 0.5 }]),
    )
  }

  onUnmounted(stopAll)

  return {
    sounds: AMBIENT_SOUNDS,
    states,
    toggle,
    setVolume,
    stopAll,
  }
}
