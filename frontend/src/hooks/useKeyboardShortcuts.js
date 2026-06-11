import { useEffect, useState } from 'react'

export function useKeyboardShortcuts(setTab, isAdmin) {
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    function handleKey(e) {
      // Ignorer si focus dans un input, textarea ou éditeur
      const tag = document.activeElement?.tagName
      const isEditing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
      const isTiptap = document.activeElement?.closest('.tiptap')
      if (isEditing || isTiptap) return

      switch (e.key.toLowerCase()) {
        case 'n': setTab('saisie'); break
        case 'h': setTab('liste'); break
        case 'r': setTab('stats'); break
        case 'd': setTab('dashboard'); break
        case 'j': if (isAdmin) setTab('activity'); break
        case 'e': if (isAdmin) setTab('users'); break
        case '?': setShowHelp(h => !h); break
        case 'escape': setShowHelp(false); break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [setTab, isAdmin])

  return { showHelp, setShowHelp }
}