import { useEffect, useState } from 'react'
import { CARD_FONT_NAME } from './text'

const probe = `16px '${CARD_FONT_NAME}'`

/**
 * El canvas dibuja con la fuente de reemplazo si todavía no cargó la real, y
 * no se redibuja solo cuando llega. Esto fuerza un re-render cuando está lista.
 */
export function useFontsReady() {
  const [ready, setReady] = useState(() => document.fonts.check(probe))

  useEffect(() => {
    if (ready) return
    let cancelled = false
    void document.fonts.load(probe).then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [ready])

  return ready
}
