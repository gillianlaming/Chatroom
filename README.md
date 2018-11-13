# README #

###ISSUES:
- enter, leave, enter again, leave, enter again -- nothing displays
- leaving a room does not remove the user from the list
- somehow leaving a room adds the first user to the top of the list?

###Todos:

######Gillian:
- if a user closes tab w/o leaving room, idk how to deal w that w/r/t database
- slide into dms
- if room is private, we need a dialog box for password, and then pass that to sql
- if a user wants to enter a room that is private, dialog box to submit password and then check that w the sql
- chat creators 

######Leela:
- remove users from database when they leave the site!!

######later to dos:
- rooms can be password protected (have a pop up window when you enter a room, but css must be working at this point)
- room creators can ban people from rooms
- also temporarily block
- make it so that you don't have to delete text from message box after you send a message
- rooms can be private

######Steps:
1. display all existing rooms
2. rooms are clickable, onclick shows us the chat/messages
3. user sets nickname when they first enter the room --socket will store the nickname, can also broadcast to everyone when a new person has joined
4. adding messages to chat:
    *appending html
    *using sockets to add it to everybody's html, making sure it goes into mySQL, not refreshing
5. creating a room: use dialog box (?) to pass info to html and mySQL
6. room creators: temporarily kick off others, ban others from joining room
7. private rooms: in dialog box, box to make chat room private, set box in

######Creative Portion Ideas:
1. delete a room that you created
2. set a color for chat room
3. slide into that dm SAD! we already have to do this!! :( 
    * https://stackoverflow.com/questions/17476294/how-to-send-a-message-to-a-particular-client-with-socket-io 

####Resources:
  1. Helpful socket overview + code. https://openclassrooms.com/en/courses/2504541-ultra-fast-applications-using-node-js/2505653-socket-io-let-s-go-to-real-time 

  


