# README #

#ideas

* opening up page, "choose a nickname" html form boxc
Todos:
1. figure out why css isnt working
2. change username (gillian)
3. use sockets to get room names from mySQL (gillian)
4. figure out why the css isnt working
5. package.json

Gillian to dos:
- make sure users are being printed correctly after entering a room
- when a user leaves a room the room info is removed from the sql
- after entering a room, their messages has a room attribute in the sql
- after entering a room, all the old messages will be printed (how to have scroll bar?)

later to dos:
- rooms can be password protected (have a pop up window when you enter a room, but css must be working at this point)
- room creators can be banned from room

Steps:
1. display all existing rooms
2. rooms are clickable, onclick shows us the chat/messages
3. user sets nickname when they first enter the room --socket will store the nickname, can also broadcast to everyone when a new person has joined
4. adding messages to chat:
    *appending html
    *using sockets to add it to everybody's html, making sure it goes into mySQL, not refreshing
5. creating a room: use dialog box (?) to pass info to html and mySQL
6. room creators: temporarily kick off others, ban others from joining room
7. private rooms: in dialog box, box to make chat room private, set box in


Creative Portion Ideas:
1. delete a room that you created
2. set a color for chat room
3. slide into that dm
    * https://stackoverflow.com/questions/17476294/how-to-send-a-message-to-a-particular-client-with-socket-io 

Show create table shit:
1. messages:
messages | CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` mediumtext NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user` varchar(255) NOT NULL,
  `room_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_name` (`room_name`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`room_name`) REFERENCES `rooms` (`name`)

  2. ---+
|rooms | CREATE TABLE `rooms` (
  `name` varchar(255) NOT NULL,
  `messages` mediumtext NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `user` varchar(255) NOT NULL,
  PRIMARY KEY (`name`)

3. 
  users | CREATE TABLE `users` (
  `user` varchar(255) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=latin1 |

  Resources:
  1. Helpful socket overview + code. https://openclassrooms.com/en/courses/2504541-ultra-fast-applications-using-node-js/2505653-socket-io-let-s-go-to-real-time 

  2. to connect to mysql, run this terminal command in directory of files (in instance)
 -  $ npm install mysql, 
 - socket.io,  
 - npm ??
 - curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -
 - sudo yum install -y nodejs
 - npm install mime


  


