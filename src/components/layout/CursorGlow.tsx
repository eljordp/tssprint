import { useEffect, useRef, useState } from 'react'

export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (isMobile) return

    document.body.style.cursor = 'none'

    const move = (e: MouseEvent) => {
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`
        dotRef.current.style.top = `${e.clientY}px`
      }
      if (!visible) setVisible(true)
    }
    const leave = () => setVisible(false)
    const enter = () => setVisible(true)

    window.addEventListener('mousemove', move)
    document.body.addEventListener('mouseleave', leave)
    document.body.addEventListener('mouseenter', enter)

    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', move)
      document.body.removeEventListener('mouseleave', leave)
      document.body.removeEventListener('mouseenter', enter)
    }
  }, [isMobile, visible])

  if (isMobile) return null

  return (
    <>
      <style>{`
        *, *::before, *::after { cursor: none !important; }
      `}</style>
      <div
        ref={dotRef}
        className="pointer-events-none fixed z-[9999]"
        style={{
          width: 12,
          height: 12,
          marginLeft: -6,
          marginTop: -6,
          borderRadius: '50%',
          backgroundColor: 'hsl(198 93% 60%)',
          opacity: visible ? 1 : 0,
          boxShadow: '0 0 8px hsl(198 93% 60% / 0.6)',
        }}
      />
    </>
  )
}
