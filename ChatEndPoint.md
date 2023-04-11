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

- allPublicChannel
- allProtectedChannel
- channelName
- channelMode
- channelId
- allUserOnChannel
- allUserProfil
- allMessage

### POST

### PUT

- updateName
- updateMode
- updatePassword
- updateUserProfil

### DELETE

- delteChannel


## MESSAGE
### GET

- allUserMessage
- allChannelMessage

### POST

- addMessage
