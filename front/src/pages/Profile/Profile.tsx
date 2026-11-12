import { useRef, useState } from 'react'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import Button from '../../components/Buttons/Buttons'
import './Profile.css'

function Profile() {
  const [avatar, setAvatar] = useState('/profile-avatar.svg')
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [isEditingPhoto, setIsEditingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (file: File | undefined) => {
    if (!file) return
    const nextPreview = URL.createObjectURL(file)
    if (previewAvatar) URL.revokeObjectURL(previewAvatar)
    setPreviewAvatar(nextPreview)
  }

  const savePhoto = () => {
    if (previewAvatar) {
      setAvatar(previewAvatar)
      setPreviewAvatar(null)
    }
    setIsEditingPhoto(false)
  }

  const cancelPhotoEdit = () => {
    if (previewAvatar) URL.revokeObjectURL(previewAvatar)
    setPreviewAvatar(null)
    setIsEditingPhoto(false)
  }

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-page__main">
        <p className="profile-page__eyebrow">BRAYTECH / IDENTITÉ</p>
        <h1>Mon profil</h1>
        <section className="profile-card" aria-labelledby="profile-title">
          <div className="profile-card__header">
            <div className="profile-card__photo-area">
              <img
                className="profile-card__photo"
                src={previewAvatar ?? avatar}
                alt="Photo de profil"
              />
              {!isEditingPhoto && (
                <Button type="button" variant="secondary" onClick={() => setIsEditingPhoto(true)}>
                  Modifier la photo
                </Button>
              )}
              {isEditingPhoto && (
                <div className="profile-card__photo-actions">
                  <input
                    ref={fileInputRef}
                    className="profile-card__file-input"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(event) => handlePhotoChange(event.target.files?.[0])}
                  />
                  <Button type="button" onClick={() => fileInputRef.current?.click()}>
                    Choisir une photo
                  </Button>
                  <div>
                    <Button type="button" onClick={savePhoto}>
                      Enregistrer
                    </Button>
                    <Button type="button" variant="secondary" onClick={cancelPhotoEdit}>
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <p className="profile-card__eyebrow">PROFIL / BT-07</p>
              <h2 id="profile-title">Gardien Braytech</h2>
              <p className="profile-card__status">Profil opérationnel</p>
            </div>
          </div>

          <form className="profile-card__form" onSubmit={(event) => event.preventDefault()}>
            <label>
              Pseudo
              <input defaultValue="Gardien Braytech" name="username" type="text" />
            </label>
            <label>
              Adresse e-mail
              <input defaultValue="gardien@braytech.todo" name="email" type="email" />
            </label>
            <label>
              Mot de passe
              <input name="password" placeholder="••••••••" type="password" />
            </label>
            <Button type="submit">Enregistrer les modifications</Button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Profile
