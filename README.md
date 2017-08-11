# Chino-chan - In development!
Chino-chan is a small Discord bot with some entertainment and server management features.! For the invitation link, click [here](https://discordapp.com/oauth2/authorize?client_id=271658919443562506&scope=bot&permissions=0)~

# Default settings
Language: English (only English is available *yet*)

Prefix: `$`

# Modules
### The server owner can use each command below
> For every user

`$admin` - Displays admins according to the server. Global Admins are also mentioned here, even if they're not in the server.

`$avatar` - Sends a user's avatar according to the user's username, or if it used on guild, the user's display name, and if there's multiple matches, she sends them all c:

`$info` - Displays some information about her, where is she joined, etc...

`$serverinfo` - Displays some information about the environment where she is running~

`$git` - Displays [this](https://github.com/ExModify/Chino-chan) page, also the version and the changes

`$help` - Displays the available commands

`$highlight` - Highlights a message

`$id` - Gets a user's id in the server

`$image` - Online image search

`$invite` - Sends an invitation link so if you're on a guild where Chino-chan is, and you want to invite her, type this, and she'll give you the link c:

`$lenny` - ( ͡° ͜ʖ ͡°)

`$music` - Music player

`$chino` - Gives you a picture of her owo

`$momiji` - Gives you a picture of Momiji

`$neko` - Gives you a random neko owo 

`$nsfw` - Gives you a random nsfw image o//o

`$sfw` - Gives you a random image, which can be also memes, draws

`$voiceInvite` - Generates you a voice invitation link to the channel you are

`$waifu` - no.


> Administrators

`$prefix` - Changes the prefix in the guild

`$delete` - Deletes images

`$language` - Changes the language of her

`$say` - Basic say command


> Global Administrators

`$purge` - Purges a channel

> Bot Owner

`$execute` - Executes a node.js command

`$game` - Changes her game

`$reload` - She reloads herself

`$restart` - Restarts her, and her handler

`$rmodule` - She reloads one of her modules

`$shutdown` - She turns herself off :c

`$update` - She updates herself


# Incoming modules
WebServer - admins can manage the server where they are through browser and Windows Application (C#)

Image - Sankaku search

Music player - more supporting sites, also processing playlists

Basis guild user management

# Known bugs
When the bot disconnects from a voice channel in a guild, the audio streaming stops everywhere, but it's a [Discord bug](https://trello.com/c/fVzj57Pa/181-bot-disconnecting-from-an-audio-server-in-mutual-guild-stops-playback-in-current-voicechannel), so I can't deal with it :c

# Other informations
**You should edit the `data/vars.js` file before the settings are being created! It begins in the first line! Also you should change the language file, because it's written for me~**

If you'd like to run at your own, there're the syntaxes:

Discord Token: only contains the token

osu! API: only contains the API

osu! IRC: first line: Username, second line: password

The pathes are folders, which should end with \