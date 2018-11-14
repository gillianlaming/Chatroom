# README #

###ISSUES:
- no incorrect password alert
- server side js stops working after inserting info into banned db? it inserts, then next time a user tries to enter a room, nothing happens. really confused about this one. 

###Todos:
- cancel button for password

######Gillian:
- direct messaging: where does button go

######Leela:
- remove users from database when they leave the site!!
- banned users get an alert when they try to click on a room they are banned from
- if banned from more than 2 rooms, get kicked off the site! (aka reload)

######later to dos:
- room creators can ban people from rooms
- also temporarily block
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

  


