import { useState } from 'react'
import type { FormEvent } from 'react'
import './ContactForm.css'

function ContactForm() {
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSent(true)
    event.currentTarget.reset()
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        Nom
        <input name="name" type="text" autoComplete="name" required />
      </label>
      <label>
        Adresse e-mail
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Sujet
        <input name="subject" type="text" required />
      </label>
      <label>
        Message
        <textarea name="message" rows={6} required />
      </label>
      <button className="contact-form__submit" type="submit">
        Envoyer la transmission
      </button>
      {isSent && (
        <p className="contact-form__success" role="status">
          Transmission enregistrée. Notre équipe reviendra vers vous prochainement.
        </p>
      )}
    </form>
  )
}

export default ContactForm
