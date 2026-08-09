import { useEffect, useState } from 'react'

/**
 * Caché de imágenes compartida por todo el render.
 *
 * `use-image` crea un `Image` propio por cada componente y avisa recién en el
 * evento `load`, así que una carta nunca queda completa en el primer dibujo.
 * Para el preview da igual —se redibuja solo cuando llegan las capas—, pero la
 * hoja de impresión dibuja la carta en un canvas y la lee enseguida: ahí un
 * icono que todavía no cargó sale como un hueco y nadie se entera.
 *
 * Con la caché la respuesta es sincrónica en cuanto la imagen se cargó una
 * vez: `preloadImages` la llena antes de exportar y de ahí en más
 * `useCardImage` devuelve el `Image` en el primer render. De paso la galería
 * deja de cargar el mismo PNG una vez por miniatura.
 */
const loaded = new Map<string, HTMLImageElement>()
const loading = new Map<string, Promise<void>>()

/**
 * Carga una imagen a la caché. Una sola vez por URL, aunque la pidan varios a
 * la vez. Una imagen que no carga resuelve igual: dejar el export colgado
 * sería peor que exportar la carta sin ese icono.
 */
export function loadImage(url: string): Promise<void> {
  if (loaded.has(url)) return Promise.resolve()

  const already = loading.get(url)
  if (already) return already

  const pending = new Promise<void>((resolve) => {
    const image = new Image()

    image.addEventListener('load', () => {
      // Decodificar acá y no en el primer `drawImage` evita que el canvas se
      // dibuje antes de que los píxeles estén listos.
      void image
        .decode()
        .catch(() => {
          // Chrome falla el decode de algunas imágenes grandes que igual
          // dibuja bien; el canvas es el que manda.
        })
        .finally(() => {
          loaded.set(url, image)
          resolve()
        })
    })

    image.addEventListener('error', () => resolve())
    image.src = url
  })

  loading.set(url, pending)
  return pending
}

export async function preloadImages(urls: Iterable<string>): Promise<void> {
  await Promise.all([...urls].map(loadImage))
}

/**
 * La imagen si ya está en la caché, `undefined` mientras carga. Cuando llega
 * fuerza un re-render, que es lo que hace que el preview se complete solo.
 */
export function useCardImage(url: string | null | undefined) {
  const [, redraw] = useState(0)

  useEffect(() => {
    if (!url || loaded.has(url)) return

    let alive = true
    void loadImage(url).then(() => {
      if (alive) redraw((count) => count + 1)
    })

    return () => {
      alive = false
    }
  }, [url])

  return url ? loaded.get(url) : undefined
}
