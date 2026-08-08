import { useLayoutEffect, useState, type RefObject } from 'react'
import { CARD_HEIGHT, CARD_WIDTH } from './constants'

/**
 * Escala a la que hay que mostrar la carta para que entre en el contenedor.
 * Nunca pasa de 1: no tiene sentido ampliar más allá del tamaño real.
 */
export function useFitScale(ref: RefObject<HTMLElement | null>, padding = 48) {
  const [scale, setScale] = useState(0.5)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const fit = Math.min(
        (width - padding) / CARD_WIDTH,
        (height - padding) / CARD_HEIGHT,
        1,
      )
      setScale(Math.max(fit, 0.1))
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, padding])

  return scale
}
