import { useEffect } from 'react'

export default function Reviews() {
  useEffect(() => {
    if (!document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://static.elfsight.com/platform/platform.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  return (
    <section className="w-full py-12 md:py-16 bg-background">
      <div className="section-container">
        <div
          className="elfsight-app-5915ab6d-ea02-4841-9033-e6c905f52098"
          data-elfsight-app-lazy
        />
      </div>
    </section>
  )
}
