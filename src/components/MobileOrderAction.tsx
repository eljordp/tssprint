import { useEffect, useState } from 'react'

export default function MobileOrderAction({ regionId, price, detail, label, disabled, onClick }: {
  regionId: string; price: string; detail: string; label: string; disabled?: boolean; onClick: () => void
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const target = document.getElementById(regionId)
    if (!target) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(target)
    return () => observer.disconnect()
  }, [regionId])
  if (!visible) return null
  return <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] flex items-center gap-4">
    <div><p className="font-bold text-lg">{price}</p><p className="text-xs text-muted-foreground">{detail}</p></div>
    <button type="button" disabled={disabled} onClick={onClick} className="btn-primary flex-1 justify-center disabled:opacity-50">{label}</button>
  </div>
}
