# CHAT ENDPOINT

## USER
### GET

- userById
- allFriends
- allBlockedUser
- allUserChannel
- allUserChannelProfil

### POST

- addFriend
- addBlockedUser
- createChannel

### DELETE

- leaveChannel
- deleteFriend
- deleteBlockedUser


## CHANNEL

`/channel/:<channel-name>/messages`

### GET

<!-- - allChannels -->
<!-- - allPublicChannel -->
<!-- - allProtectedChannel -->
<!-- - channelName -->
<!-- - channelMode -->
<!-- NOTE: bah du coup non? -->
- channelId
<!-- NOTE: Pas ici mais dans User non? (findMany(where channelId = id)) --> 
- allUserOnChannel
- allUserProfil
<!-- NOTE: pense pas que ce soit ici (pas ds entity) -->
- allMessage

### POST
<!-- NOTE: Fait dans channel, a deplacer dans user. -->
<!-- - createChannel -->

### PUT

<!-- NOTE: update name et mode fait en meme temps -->
<!-- - updateName -->
<!-- - updateMode -->
- updatePassword
- updateUserProfil

### DELETE

<!-- - delteChannel -->


## MESSAGE
### GET

<!-- - allUserMessage -->
<!-- - allUserMessageInChan -->
<!-- - allChannelMessage -->

### POST

<!-- - addMessage -->
