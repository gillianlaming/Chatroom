# README #

#ideas

* opening up page, "choose a nickname" html form boxc

Database:

*tables: rooms, messages, 
*room: id (primary key), name, creator, members(?)
*meesages: id (primary), content, timestamp, user, room (foreign key)

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
  `room_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `room_name` (`room_name`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`room_name`) REFERENCES `rooms` (`name`)

  2. ---+
| rooms | CREATE TABLE `rooms` (
  `name` varchar(255) NOT NULL,
  `messages` mediumtext NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`name`)

