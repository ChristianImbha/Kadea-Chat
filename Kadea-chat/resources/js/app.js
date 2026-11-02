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
    // Affiche la notification aprÃ¨s son entrÃ©e puis la masque automatiquement.
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

// Enregistre le contrÃ´le du thÃ¨me clair/sombre et sa persistance entre visites.

Alpine.data('themeToggle', function () {
  return {
    theme: 'light',

    init() {
  const savedTheme = this.$el.dataset.initialTheme
  const theme =
    savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : 'light'

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

    // Ouvre le menu d'actions lorsqu'on clique sur son bouton.
  chatMessages.addEventListener('click', (event) => {
    const trigger = event.target.closest(
      '.chat-message__actions-trigger'
    )

    const clickedMenuButton = event.target.closest(
      '[data-message-action]'
    )

    if (clickedMenuButton) {
      return
    }

    const currentMenu = trigger
      ?.closest('.chat-message__actions')
      ?.querySelector('.chat-message__actions-menu')

    chatMessages
      .querySelectorAll('.chat-message__actions-menu')
      .forEach((menu) => {
        if (menu !== currentMenu) {
          menu.hidden = true

          const button = menu
            .closest('.chat-message__actions')
            ?.querySelector('.chat-message__actions-trigger')

          button?.setAttribute('aria-expanded', 'false')
        }
      })

    if (trigger && currentMenu) {
      currentMenu.hidden = !currentMenu.hidden

      trigger.setAttribute(
        'aria-expanded',
        String(!currentMenu.hidden)
      )
    }
  })

  // Ferme les menus lorsqu'on clique ailleurs dans la page.
  document.addEventListener('click', (event) => {
    if (chatMessages.contains(event.target)) {
      return
    }

    chatMessages
      .querySelectorAll('.chat-message__actions-menu')
      .forEach((menu) => {
        menu.hidden = true

        menu
          .closest('.chat-message__actions')
          ?.querySelector('.chat-message__actions-trigger')
          ?.setAttribute('aria-expanded', 'false')
      })
  })
  const transmit = new Transmit({
    baseUrl: window.location.origin,
    // Genetatrice l'identifiant unique requis pour la connexion au canal temps reel.
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
  // Met a  jour un message existant ou ajoute un nouveau message.
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

    let messageElement = chatMessages.querySelector(
      `[data-message-id="${data.id}"]`
    )

    const isNewMessage = !messageElement

    if (isNewMessage) {
      messageElement = document.createElement('article')
      messageElement.className =
        data.userId === currentUserId
          ? 'chat-message chat-message--sent'
          : 'chat-message chat-message--received'

      messageElement.dataset.messageId = String(data.id)
      messageElement.dataset.userId = String(data.userId)

      const author = document.createElement('strong')
      author.textContent =
        data.userId === currentUserId
          ? 'Moi'
          : String(data.author ?? 'Utilisateur')

      const time = document.createElement('small')
      const createdAt = data.createdAt ? new Date(data.createdAt) : null

      time.textContent =
        createdAt && !Number.isNaN(createdAt.getTime())
          ? new Intl.DateTimeFormat('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).format(createdAt)
          : ''

      messageElement.append(author, time)
      chatMessages.appendChild(messageElement)
    }

    messageElement.dataset.deleted = String(data.isDeleted === true)

    // Retirer l'ancien contenu et les anciennes actions avant de reconstruire.
    messageElement.querySelector(
      '.chat-message__content, .chat-message__deleted'
    )?.remove()

    messageElement.querySelector('.chat-message__actions')?.remove()

    if (data.isDeleted === true) {
      const deleted = document.createElement('p')
      deleted.className = 'chat-message__deleted'
      deleted.textContent = 'Ce message a Ã©tÃ© supprimÃ©.'
      messageElement.insertBefore(deleted, messageElement.querySelector('small'))
      return
    }

    const content = document.createElement('p')
    content.className = 'chat-message__content'
    content.textContent = data.content

    const time = messageElement.querySelector('small')
    messageElement.insertBefore(content, time)

    // Les options ne sont disponibles que pour les messages de l'utilisateur.
    if (data.userId === currentUserId) {
      const actions = document.createElement('div')
      actions.className = 'chat-message__actions'

      const trigger = document.createElement('button')
      trigger.type = 'button'
      trigger.className = 'chat-message__actions-trigger'
      trigger.setAttribute('aria-label', 'Options du message')
      trigger.setAttribute('aria-expanded', 'false')
      trigger.textContent = 'â‹¯'

      const menu = document.createElement('div')
      menu.className = 'chat-message__actions-menu'
      menu.hidden = true

      const editButton = document.createElement('button')
      editButton.type = 'button'
      editButton.dataset.messageAction = 'edit'
      editButton.textContent = 'Modifier'

      const deleteButton = document.createElement('button')
      deleteButton.type = 'button'
      deleteButton.dataset.messageAction = 'delete'
      deleteButton.textContent = 'Supprimer'

      menu.append(editButton, deleteButton)
      actions.append(trigger, menu)
      messageElement.insertBefore(actions, time)
    }

    if (isNewMessage) {
      chatMessages.scrollTop = chatMessages.scrollHeight
    }
  })

    // GÃ¨re les actions Modifier et Supprimer.
  chatMessages.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-message-action]')

    if (!button) return

    const messageElement = button.closest('[data-message-id]')
    if (!messageElement) return

    const messageId = messageElement.dataset.messageId
    const action = button.dataset.messageAction
    const contentElement = messageElement.querySelector(
      '.chat-message__content'
    )

    if (!messageId || !contentElement) return

    // Le serveur reste responsable de vÃ©rifier l'autorisation.
    if (Number(messageElement.dataset.userId) !== currentUserId) {
      return
    }

    let content

    if (action === 'edit') {
      content = window.prompt(
        'Modifier le message :',
        contentElement.textContent
      )

      if (content === null) return

      content = content.trim()

      if (!content || content.length > 5000) {
        window.alert('Le message doit contenir entre 1 et 5000 caractÃ¨res.')
        return
      }
    } else if (action === 'delete') {
      if (!window.confirm('Veux-tu vraiment supprimer ce message ?')) {
        return
      }
    } else {
      return
    }

    button.disabled = true

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

      const response = await fetch(
        `/conversations/${conversationId}/messages/${messageId}/${action}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(action === 'edit' ? { content } : {}),
          credentials: 'same-origin',
        }
      )

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.error || `Erreur HTTP ${response.status}`)
      }

      // Transmit actualisera les bulles de tous les participants.
      // L'interface locale sera actualisÃ©e par cet Ã©vÃ©nement.
    } catch (error) {
      console.error(`Ã‰chec de l'action ${action} :`, error)
      window.alert(error.message || 'Une erreur est survenue.')
    } finally {
      button.disabled = false
    }
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

  // Envoie le message au serveur et laisse Transmit mettre Ã  jour l'historique.
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

      // Le message est normalement affichÃ© par Transmit.

      if (!result.message) {
        throw new Error('RÃ©ponse du serveur invalide.')
      }

      contentInput.value = ''
      contentInput.focus()
    } catch (error) {
      console.error("Ã‰chec de l'envoi du message :", error)
      alert("Impossible d'envoyer le message. VÃ©rifie ta connexion et rÃ©essaie.")
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
  // Actualise les rÃ©sultats Ã  chaque modification du champ de recherche.
  userSearchInput.addEventListener('input', () => {
    // Convertit la saisie en minuscules et retire les espaces inutiles.
    const searchTerm = userSearchInput.value.trim().toLowerCase()

    // Parcourt les utilisateurs affichÃ©s dans le tableau de bord.
    searchableUsers.forEach((user) => {
      // RÃ©cupÃ¨re le nom et l'adresse e-mail associÃ©s Ã  cet utilisateur.
      const userInfo = (user.dataset.search || '').toLowerCase()

      // Affiche l'utilisateur si ses informations correspondent Ã  la recherche.
      user.style.display = userInfo.includes(searchTerm) ? '' : 'none'
    })
  })

// ============================================================
// KADEA CHAT — Gestion robuste du clavier mobile (Visual Viewport)
// ============================================================

function updateChatHeight() {
  const appMain = document.querySelector('.app-main')
  const chatPage = document.querySelector('.chat-page')
  const viewport = window.visualViewport

  if (!appMain || !chatPage || !viewport) return

  // Sur mobile (largeur <= 700px), on fixe la hauteur exactement sur la zone visible
  if (window.innerWidth <= 700) {
    appMain.style.position = 'fixed'
    appMain.style.top = `${viewport.offsetTop}px`
    appMain.style.left = '0'
    appMain.style.width = '100vw'
    appMain.style.height = `${viewport.height}px`
  } else {
    // Mode Desktop / Tablette large : réinitialisation
    appMain.style.position = ''
    appMain.style.top = ''
    appMain.style.left = ''
    appMain.style.width = ''

    // Calcul de la hauteur disponible
    const appTop = appMain.getBoundingClientRect().top
    const availableHeight = viewport.height + viewport.offsetTop - appTop
    appMain.style.setProperty(
      '--chat-available-height',
      `${Math.max(0, availableHeight)}px`
    )
  }
}

// Gestionnaire optimisé pour éviter les saccades lors de l'ouverture du clavier
let rafId
function triggerUpdate() {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(updateChatHeight)
}

// Écouteurs d'événements
window.addEventListener('load', updateChatHeight)
window.addEventListener('resize', triggerUpdate)
window.visualViewport?.addEventListener('resize', triggerUpdate)
window.visualViewport?.addEventListener('scroll', triggerUpdate)
}