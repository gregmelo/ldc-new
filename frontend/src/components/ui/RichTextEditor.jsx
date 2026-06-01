import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: '4px 8px',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: active ? 700 : 400,
        background: active ? 'var(--accent-bg)' : 'transparent',
        color: active ? 'var(--accent-text)' : 'var(--text2)',
        transition: 'all 0.1s',
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return (
    <span style={{
      width: 1, height: 18,
      background: 'var(--border2)',
      margin: '0 4px',
      display: 'inline-block',
      verticalAlign: 'middle',
    }} />
  )
}

export default function RichTextEditor({ value, onChange, placeholder = 'Détails, solution apportée...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sync valeur externe
  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false)
    }
  }, [value])

  if (!editor) return null

  function setLink() {
    const url = window.prompt('URL du lien :')
    if (!url) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  return (
    <div style={{
      border: '0.5px solid var(--border2)',
      borderRadius: 8,
      background: 'var(--surface2)',
      overflow: 'hidden',
    }}>
      {/* Barre d'outils */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        padding: '6px 8px',
        borderBottom: '0.5px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Titre"
        >H</ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Gras"
        ><strong>G</strong></ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italique"
        ><em>I</em></ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Liste à puces"
        >• Liste</ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Liste numérotée"
        >1. Liste</ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={setLink}
          active={editor.isActive('link')}
          title="Insérer un lien"
        >🔗</ToolbarButton>

        {editor.isActive('link') && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Supprimer le lien"
          >✕ lien</ToolbarButton>
        )}

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Citation"
        >❝</ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Code inline"
        >{'<>'}</ToolbarButton>
      </div>

      {/* Zone de texte */}
      <EditorContent
        editor={editor}
        style={{ minHeight: 120, padding: '10px 12px', fontSize: 14 }}
      />
    </div>
  )
}