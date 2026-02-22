import { useEffect, useState, useRef } from 'react'

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const animationRef = useRef<number>(null)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', handleMouseMove)
    document.body.addEventListener('mouseleave', handleMouseLeave)
    document.body.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
      document.body.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isVisible, isMobile])

  useEffect(() => {
    if (isMobile) return

    const animate = () => {
      setTrailPosition((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.08,
        y: prev.y + (position.y - prev.y) * 0.08,
      }))
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [position, isMobile])

  if (isMobile) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div
        className="absolute rounded-full blur-[100px]"
        style={{
          width: '280px',
          height: '280px',
          left: trailPosition.x - 140,
          top: trailPosition.y - 140,
          background: 'radial-gradient(circle, hsl(198 93% 60% / 0.4) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full blur-[60px]"
        style={{
          width: '180px',
          height: '180px',
          left: position.x - 90,
          top: position.y - 90,
          background: 'radial-gradient(circle, hsl(198 93% 60% / 0.6) 0%, hsl(198 93% 60% / 0.3) 40%, transparent 70%)',
        }}
      />
    </div>
  )
}
