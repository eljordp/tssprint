import { useEffect, useState } from 'react'

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }

    const handleMouseLeave = () => setVisible(false)

    window.addEventListener('mousemove', handleMouseMove)
    document.body.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] transition-opacity duration-300"
      style={{
        background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, hsla(168, 48%, 32%, 0.06), transparent 80%)`,
      }}
    />
  )
}
