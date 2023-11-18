!(function (exports) {
  'use strict';

  const Chat = {
    messages: document.getElementById('chat-messages'),
    messageBox: document.getElementById('messagebox'),
    messageBoxInput: document.getElementById('messagebox-input'),
    attachmentButton: document.getElementById('messagebox-attachment-button'),
    sendButton: document.getElementById('messagebox-send-button'),
    mediaContainer: document.getElementById('attached-media'),

    channelId: '',
    attachedMedia: [],
    isLoaded: false,

    KB_SIZE_LIMIT: 300,

    init: async function () {
      this.messageBox.addEventListener('submit', this.handleSubmit.bind(this));
      this.attachmentButton.addEventListener('click', this.handleAttachmentButton.bind(this));
    },

    initializeChannel: async function (channelId) {
      this.isLoaded = false;
      this.messages.innerHTML = '';

      const sessionId = Math.round(Math.random() * 2147483647);

      this.channelId = channelId;
      this.sessionId = sessionId;
      OrchidServices.getWithUpdate(`messages/${channelId}`, (data) => {
        if (this.channelId !== channelId) {
          return;
        }
        if (this.sessionId !== sessionId) {
          return;
        }
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
      if (this.messageBoxInput.value === '' && this.attachedMedia.length === 0) {
        return;
      }

      const uploadedMedia = [];
      for (let index = 0; index < this.attachedMedia.length; index++) {
        const media = this.attachedMedia[index];
        const path = Math.round(Math.random() * 2147483647);
        OrchidServices.storage.add(`messages/${path}.${media.mime.split('/')[1]}`, media.data);
        uploadedMedia.push({ path, mime: media.mime });
      }

      OrchidServices.messages.sendMessage(this.channelId, this.messageBoxInput.value, uploadedMedia);
      this.messageBoxInput.value = '';
      this.attachedMedia = [];
      this.mediaContainer.innerHTML = '';

      this.mediaContainer.classList.remove('visible');
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

      const media = document.createElement('div');
      media.classList.add('media');
      content.appendChild(media);

      for (let index = 0; index < message.media.length; index++) {
        const mediaData = message.media[index];

        setTimeout(async () => {
          const url = await OrchidServices.storage.get(`messages/${mediaData.path}.${mediaData.mime.split('/')[1]}`);

          const mediaImage = document.createElement('img');
          mediaImage.classList.add('image');
          mediaImage.src = url;
          media.appendChild(mediaImage);
        }, 500);
      }

      this.messages.scrollTop = this.messages.scrollHeight + 50;
      if (message.publisher_id === (await OrchidServices.userId())) {
        element.classList.add('yours');
        Transitions.scale(this.sendButton, content);
      }

      OrchidServices.getWithUpdate(`profile/${message.publisher_id}`, async (data) => {
        avatar.src = data.profile_picture;
        username.textContent = data.username;

        this.messages.scrollTop = this.messages.scrollHeight + 50;
      });
    },

    handleAttachmentButton: function (event) {
      FilePicker(['.png', '.jpg', '.jpeg', '.webp'], (data, mime) => {
        this.attachedMedia.push({ data, mime });
        console.log(data);

        // Convert Uint8Array to string
        let binaryString = '';
        for (let i = 0; i < data.length; i++) {
          binaryString += String.fromCharCode(data[i]);
        }

        // Convert string to Base64
        const base64String = btoa(binaryString);

        // Construct Data URL
        const dataUrl = `data:${mime};base64,${base64String}`;

        compressImage(dataUrl, this.KB_SIZE_LIMIT, async (finalImage) => {
          this.mediaContainer.classList.add('visible');

          const mediaImage = document.createElement('img');
          mediaImage.classList.add('image');
          mediaImage.src = finalImage;
          this.mediaContainer.appendChild(mediaImage);
        });
      });
    }
  };

  Chat.init();

  exports.Chat = Chat;
})(window);
