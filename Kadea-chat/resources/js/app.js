import Alpine from 'alpinejs'
import { Transmit } from '@adonisjs/transmit-client'
Alpine.data('alert', function () {
  return {
    isVisible: false,
    dismiss() {
      this.isVisible = false
    },
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

Alpine.data('themeToggle', function () {
  return {
    theme: 'light',
    init() {
      this.theme = this.$el.dataset.initialTheme || 'light'
    },
    toggle() {
      const next = this.theme === 'dark' ? 'light' : 'dark'
      this.theme = next
      document.documentElement.setAttribute('data-theme', next)
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

  window.addEventListener('pagehide', () => {
    void subscription.delete()
    transmit.close()
  }, { once: true })
}

