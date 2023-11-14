!(function (exports) {
  'use strict';

  const Friends = {
    friendsList: document.getElementById('friends-list'),
    peopleList: document.getElementById('people-list'),
    chatName: document.getElementById('chat-name'),

    init: async function () {
      if ('OrchidServices' in window) {
        if (await OrchidServices.isUserLoggedIn()) {
          OrchidServices.getWithUpdate(
            `profile/${await OrchidServices.userId()}`,
            (data) => this.populateFriends(data.friends)
          );
        }
      }
    },

    populateFriends: function (friends) {
      this.friendsList.innerHTML = '';
      for (let index = 0; index < friends.length; index++) {
        const friend = friends[index];

        const element = document.createElement('li');
        element.classList.add('hbox');
        element.dataset.pageId = 'chat';
        element.addEventListener('click', () => this.handleFriendClick(friend));
        this.friendsList.appendChild(element);
        PageController.init();

        const avatar = document.createElement('img');
        element.appendChild(avatar);

        const textHolder = document.createElement('div');
        textHolder.classList.add('vbox');
        element.appendChild(textHolder);

        const username = document.createElement('p');
        textHolder.appendChild(username);

        OrchidServices.getWithUpdate(`profile/${friend.friend_id}`, (data) => {
          avatar.src = data.profile_picture;
          username.textContent = data.username;

          if (!data.status && !data.status.text) {
            return;
          }
          const status = document.createElement('p');
          status.textContent = data.status.text;
          textHolder.appendChild(status);
        });
      }
    },

    handleFriendClick: function (friend) {
      OrchidServices.get(`profile/${friend.friend_id}`).then((data) => {
        this.chatName.textContent = data.username;
        Chat.initializeChannel(friend.token);
      });
    }
  };

  window.addEventListener('orchidservicesload', () => {
    Friends.init();
  });
})(window);
