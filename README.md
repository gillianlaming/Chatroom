# README #

#### How to use our chatroom:
##### Please run `npm install` and `node chat_server.js` then open `localhost:3456`

1. First, create a username to enter the chatroom. 
    - Usernames must be unique, so if a user enters a username that already exists, there will be an alert for them to enter a different username.
2. Upon entry to the site, users will be presented with a list of existing rooms, and the option to create a new room. 
3. When creating a room, the user can click the checkbox that says "private" to create a password protected room. 
    - The user will then be prompted with a screen for them to enter a password for the room. 
    - All passwords are hashed before being stored. 
4. A user can click room buttons to enter rooms. 
    - If a room is password protected, then the user will be prompted to enter a password. 
    - If the password is correct, they will be let into the room. If the password is incorrect, there will be an error alert and the user will be brought back to the lobby. 
5. Upon entry into a room, a user will see a list of the current users in the room to the right of the chat. 
    - The user is able to enter messages into the chatroom. 
    - To the left of the messages, the user will see buttons to leave the room and delete the room
6. When the user is in a room, they are able to click on the names of the other users in the room. 
    - The user will be presented with some options. 
        - A user is able to privately message a user, where the user will enter their desired message, and that message will be sent directly to the other user. 
    - If the user is the creator of the room, they will be able to kick out and ban users. 
        - Kicking out will remove the user from the room
        - Banning will remove the user and not let them re enter
    - If the user is not the creator of the room, they are not able to kick out and ban users. 
    - Users cannot direct message, kick out, or ban themselves. 
7. If the user closes their tab or leaves the page in some other capacity, they are removed from the room, and their name will no longer appear in the list of users in the room.

### Creative Portion
1. Delete a room that you created:
    - The first aspect of our creative portion is being able to delete a room if you are the creator of the room. 
    - If you delete a room, you are removed from the room and all of the other users in the room are also removed from the room. 
    - The room is no longer an available room to enter.
2. Curse word censoring:
    - We beleive our chat room should be a safe space for all users, and therefore have made it so that if any user uses explicit language in the messages of a chat room, their message will not be added to the log of messages, and the user will be kicked out of the room. 
  
