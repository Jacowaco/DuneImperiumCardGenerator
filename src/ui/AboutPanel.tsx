import { useT } from '../i18n/strings'

/** El repo también es el canal de contacto: ahí se abren los issues. */
const REPOSITORY = 'https://github.com/Jacowaco/DuneImperiumCardGenerator'

/** El texto del enlace sale de la URL y no se escribe aparte: escrito dos veces,
 *  cambiar el repo dejaba el visible apuntando a otro lado que el `href`. */
const REPOSITORY_LABEL = REPOSITORY.replace(/^https:\/\//, '')

/**
 * El descargo: esto es un proyecto de fans, sin fines de lucro, y las marcas
 * son de Dire Wolf y de los dueños de Dune.
 *
 * Va en diálogo porque se lee una vez —la misma regla que iconos propios e
 * impresión—, pero se abre desde la barra de arriba y no del pie de la
 * galería: no es del mazo ni de la carta abierta, es de la app entera.
 */
export function AboutPanel() {
  const t = useT()

  return (
    <div className="flex flex-col gap-3 px-5 py-5 text-xs leading-relaxed text-zinc-400">
      <p className="text-zinc-200">
        {t.topBar.title} {t.topBar.subtitle}{' '}
        <span className="text-zinc-600">v{__APP_VERSION__}</span>
      </p>

      <p>{t.about.fanMade}</p>
      <p>{t.about.ownership}</p>
      <p>{t.about.notAffiliated}</p>
      <p>{t.about.personalUse}</p>
      <p>{t.about.takedown}</p>

      <p>
        {t.about.source}:{' '}
        <a
          href={REPOSITORY}
          target="_blank"
          rel="noreferrer"
          className="text-sand-500 underline transition-colors hover:text-sand-300"
        >
          {REPOSITORY_LABEL}
        </a>
      </p>
    </div>
  )
}
