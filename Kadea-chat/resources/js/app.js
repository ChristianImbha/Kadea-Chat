import Alpine from 'alpinejs'
import { Transmit } from '@adonisjs/transmit-client'
// Enregistre les commandes d'affichage et de fermeture des alertes temporaires.
Alpine.data('alert', function () {
  return {
    isVisible: false,
    // Masque la notification lorsqu'on clique sur sa commande de fermeture.
    dismiss() {
      this.isVisible = false
    },
    // Affiche la notification après son entrée puis la masque automatiquement.
    init() {
      setTimeout(() => {
        this.isVisible = true
      }, 80)
      setTimeout(() => {
        this.dismiss()
      }, 5000)
    },
  }
})

// Enregistre le contrôle du thème clair/sombre et sa persistance entre visites.

Alpine.data('themeToggle', function () {
  return {
    theme: 'dark',

    init() {
      const savedTheme = this.$el.dataset.initialTheme
      const theme =
        savedTheme === 'light' || savedTheme === 'dark'
          ? savedTheme
          : 'dark'

      this.applyTheme(theme)
    },

    applyTheme(theme) {
      this.theme = theme
      document.documentElement.setAttribute('data-theme', theme)
    },

    toggle() {
      const next = this.theme === 'dark' ? 'light' : 'dark'

      this.applyTheme(next)
      document.cookie = `app_theme=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
    },
  }
})


Alpine.start()


const chatMessages = document.querySelector('#chat-messages')

if (chatMessages) {
  const conversationId = chatMessages.dataset.conversationId
  const currentUserId = Number(chatMessages.dataset.currentUserId)

  const transmit = new Transmit({
    baseUrl: window.location.origin,
    // Génère l'identifiant unique requis pour la connexion au canal temps réel.
    uidGenerator: () => {
      return Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0')
      ).join('')
    },
  })

  const subscription = transmit.subscription(
    `conversations/${conversationId}/messages`
  )

  // Reçoit les nouveaux messages et les ajoute à l'historique sans doublon.
  subscription.onMessage((message) => {
    if (!message || typeof message !== 'object') return

    const data = message

    if (
      typeof data.id !== 'number' ||
      typeof data.content !== 'string' ||
      typeof data.userId !== 'number'
    ) {
      return
    }

    // Éviter d'afficher deux fois le même message
    if (chatMessages.querySelector(`[data-message-id="${data.id}"]`)) {
      return
    }

    const messageElement = document.createElement('div')
    messageElement.className =
      data.userId === currentUserId
        ? 'chat-message chat-message--sent'
        : 'chat-message chat-message--received'

    messageElement.dataset.messageId = String(data.id)

    const author = document.createElement('strong')
    author.textContent =
      data.userId === currentUserId ? 'Moi' : String(data.author ?? 'Utilisateur')

    const content = document.createElement('p')
    content.textContent = data.content

    messageElement.append(author, content)
    chatMessages.appendChild(messageElement)
  })

  subscription.create().catch((error) => {
    console.error('Impossible de rejoindre le canal de discussion :', error)
  })

  // Ferme proprement la souscription quand l'utilisateur quitte la page.
  window.addEventListener('pagehide', () => {
    void subscription.delete()
    transmit.close()
  }, { once: true })
}


const chatForm = document.querySelector('#chat-form')

if (chatForm && chatMessages) {
  const contentInput = chatForm.querySelector('textarea[name="content"]')
  const submitButton = chatForm.querySelector('button[type="submit"]')

  // Envoie le message au serveur et laisse Transmit mettre à jour l'historique.
  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const content = contentInput.value.trim()

    if (!content || content.length > 5000) {
      return
    }

    submitButton.disabled = true

    try {
      const csrfToken = document.querySelector(
        'input[name="_csrf"]'
      )?.value

      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }

      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken
      }

      const response = await fetch(chatForm.action, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content }),
        credentials: 'same-origin',
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`)
      }

      const result = await response.json()

      // Le message est normalement affiché par Transmit.
      // Nous ne l'ajoutons pas ici pour éviter les doublons.
      if (!result.message) {
        throw new Error('Réponse du serveur invalide.')
      }

      contentInput.value = ''
      contentInput.focus()
    } catch (error) {
      console.error("Échec de l'envoi du message :", error)
      alert("Impossible d'envoyer le message. Vérifie ta connexion et réessaie.")
    } finally {
      submitButton.disabled = false
    }
  })
}


/**
 * Recherche des utilisateurs dans le tableau de bord.
 * Filtre la liste selon le nom complet ou l'adresse e-mail.
 */
const userSearchInput = document.getElementById('user-search')
const searchableUsers = document.querySelectorAll('.searchable-user')

if (userSearchInput) {
  // Actualise les résultats à chaque modification du champ de recherche.
  userSearchInput.addEventListener('input', () => {
    // Convertit la saisie en minuscules et retire les espaces inutiles.
    const searchTerm = userSearchInput.value.trim().toLowerCase()

    // Parcourt les utilisateurs affichés dans le tableau de bord.
    searchableUsers.forEach((user) => {
      // Récupère le nom et l'adresse e-mail associés à cet utilisateur.
      const userInfo = (user.dataset.search || '').toLowerCase()

      // Affiche l'utilisateur si ses informations correspondent à la recherche.
      user.style.display = userInfo.includes(searchTerm) ? '' : 'none'
    })
  })
}

