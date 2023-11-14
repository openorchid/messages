!(function (exports) {
  'use strict';

  const Chat = {
    messages: document.getElementById('chat-messages'),
    messageBox: document.getElementById('messagebox'),
    messageBoxInput: document.getElementById('messagebox-input'),
    messageBoxSendButton: document.getElementById('messagebox-send-button'),

    channelId: '',
    isLoaded: false,

    init: async function () {
      this.messageBox.addEventListener('submit', this.handleSubmit.bind(this));
    },

    initializeChannel: async function (channelId) {
      this.isLoaded = false;
      this.messages.innerHTML = '';

      this.channelId = channelId;
      OrchidServices.getWithUpdate(`messages/${channelId}`, (data) => {
        if (this.isLoaded) {
          const message = data.messages[data.messages.length - 1];
          this.createMessage(message);
          return;
        }
        for (let index = 0; index < data.messages.length; index++) {
          const message = data.messages[index];
          this.createMessage(message);
        }
        this.isLoaded = true;
      });
    },

    handleSubmit: function (event) {
      event.preventDefault();
      if (this.messageBoxInput.value === '') {
        return;
      }
      OrchidServices.messages.sendMessage(this.channelId, this.messageBoxInput.value, []);
      this.messageBoxInput.value = '';
    },

    createMessage: async function (message) {
      const element = document.createElement('div');
      element.classList.add('message');
      this.messages.appendChild(element);

      const imageContainer = document.createElement('div');
      imageContainer.classList.add('image-container');
      element.appendChild(imageContainer);

      const avatar = document.createElement('img');
      avatar.classList.add('avatar');
      imageContainer.appendChild(avatar);

      const textHolder = document.createElement('div');
      textHolder.classList.add('text-holder');
      element.appendChild(textHolder);

      const messageInfo = document.createElement('div');
      messageInfo.classList.add('message-info');
      textHolder.appendChild(messageInfo);

      const username = document.createElement('div');
      username.classList.add('username');
      messageInfo.appendChild(username);

      const content = document.createElement('div');
      content.classList.add('content');
      textHolder.appendChild(content);

      const messageText = document.createElement('div');
      messageText.classList.add('text');
      messageText.innerText = message.content;
      content.appendChild(messageText);

      this.messages.scrollTop = this.messages.scrollHeight + 50;
      if (message.publisher_id === await OrchidServices.userId()) {
        element.classList.add('yours');
        Transitions.scale(this.messageBoxSendButton, content);
      }

      OrchidServices.getWithUpdate(`profile/${message.publisher_id}`, async (data) => {
        avatar.src = data.profile_picture;
        username.textContent = data.username;

        this.messages.scrollTop = this.messages.scrollHeight + 50;
      });
    }
  };

  Chat.init();

  exports.Chat = Chat;
})(window);
