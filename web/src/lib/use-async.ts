import { useCallback, useEffect, useState, type DependencyList } from 'react'

type AsyncState<T> = { loading: boolean; data: T | null; error: unknown }

// Menjalankan fungsi async saat deps berubah; hasil permintaan lama diabaikan bila deps sudah berganti.
export function useAsync<T>(load: () => Promise<T>, deps: DependencyList) {
  const [tick, setTick] = useState(0)
  const [state, setState] = useState<AsyncState<T>>({ loading: true, data: null, error: null })

  useEffect(() => {
    let alive = true
    load().then(
      (data) => alive && setState({ loading: false, data, error: null }),
      (error: unknown) => alive && setState({ loading: false, data: null, error }),
    )
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, reload }
}
