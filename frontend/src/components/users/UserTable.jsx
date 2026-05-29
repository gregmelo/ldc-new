import { useEffect, useState } from 'react'
import { useUserStore, useAuthStore } from '../../store'
import Modal from '../ui/Modal'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR')
}

export default function UserTable() {
  const { users, loading, fetch, create, remove, updatePassword } = useUserStore()
  const currentUser = useAuthStore((s) => s.user)

  const [showAdd,     setShowAdd]     = useState(false)
  const [pwdModal,    setPwdModal]    = useState(null) // { id, username }
  const [newUser,     setNewUser]     = useState({ username: '', password: '', role: 'user' })
  const [newPwd,      setNewPwd]      = useState('')
  const [addError,    setAddError]    = useState('')
  const [pwdStatus,   setPwdStatus]   = useState(null)

  useEffect(() => { fetch() }, [])

  async function handleCreate() {
    if (!newUser.username || !newUser.password) { alert('Remplir tous les champs.'); return }
    setAddError('')
    const result = await create(newUser)
    if (result?.success) {
      setShowAdd(false)
      setNewUser({ username: '', password: '', role: 'user' })
      fetch()
    } else {
      setAddError(result?.error || 'Erreur.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return
    await remove(id)
  }

  async function handlePwd() {
    if (!newPwd) { alert('Merci de saisir un mot de passe.'); return }
    setPwdStatus(null)
    const result = await updatePassword(pwdModal.id, newPwd)
    if (result?.success) {
      setPwdStatus('success')
      setTimeout(() => { setPwdModal(null); setPwdStatus(null); setNewPwd('') }, 1500)
    } else {
      setPwdStatus('error')
    }
  }

  return (
    <div className="card">
      <div className="section-header">
        <span className="section-header__title">Gestion de l'équipe</span>
        <button
          className="btn btn--sm"
          style={{ background: 'var(--accent, #185FA5)', color: '#fff', borderColor: 'var(--accent, #185FA5)' }}
          onClick={() => setShowAdd(true)}
        >
          + Ajouter
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Utilisateur</th><th>Rôle</th><th>Créé le</th><th></th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="empty">Chargement...</td></tr>}
            {!loading && !users.length && <tr><td colSpan={4} className="empty">Aucun utilisateur.</td></tr>}
            {!loading && users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td><span className={`badge badge--${u.role}`}>{u.role === 'admin' ? '⭐ Admin' : 'Utilisateur'}</span></td>
                <td>{formatDate(u.created_at)}</td>
                <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button className="btn btn--sm" onClick={() => { setPwdModal({ id: u.id, username: u.username }); setNewPwd('') }}>
                    Mot de passe
                  </button>
                  {currentUser?.username !== u.username && (
                    <button className="btn btn--danger btn--sm" onClick={() => handleDelete(u.id)}>✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal ajouter */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Ajouter un utilisateur">
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label>Nom d'utilisateur</label>
          <input type="text" value={newUser.username} onChange={(e) => setNewUser((u) => ({ ...u, username: e.target.value }))} placeholder="Ex : gregory" />
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label>Mot de passe</label>
          <input type="password" value={newUser.password} onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))} placeholder="••••••••" />
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>Rôle</label>
          <select value={newUser.role} onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))}>
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>
        {addError && <div className="alert alert--error">{addError}</div>}
        <button className="btn btn--primary" style={{ marginTop: addError ? 8 : 0 }} onClick={handleCreate}>Créer l'utilisateur</button>
      </Modal>

      {/* Modal changer mot de passe */}
      <Modal open={!!pwdModal} onClose={() => { setPwdModal(null); setPwdStatus(null); setNewPwd('') }} title="Changer le mot de passe">
        {pwdModal && (
          <>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: '1rem' }}>
              Utilisateur : <strong>{pwdModal.username}</strong>
            </p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Nouveau mot de passe</label>
              <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="••••••••" />
            </div>
            {pwdStatus === 'success' && <div className="alert alert--success">✓ Mot de passe modifié !</div>}
            {pwdStatus === 'error'   && <div className="alert alert--error">Erreur lors de la modification.</div>}
            <button className="btn btn--primary" style={{ marginTop: pwdStatus ? 8 : 0 }} onClick={handlePwd}>Enregistrer</button>
          </>
        )}
      </Modal>
    </div>
  )
}
