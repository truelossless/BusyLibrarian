# BusyLibrarian

## Download ebooks from torrents and import them automatically in calibre !

Inspired by LazyLibrarian, and conceived as a simpler (and less complete) alternative.

## Features
- Search GoodReads for your favorite books
- Download any selected book from your favorite torrent trackers
- import automatically any downloaded book in your calibre library

## And also ...
- Beautiful design <3 (you decide)
- Easy to use
- Responsive design
- Fast UI with few page reloads

BusyLibrarian is built to work with:
 - A Torznab provider to fetch the torrents, such as Jackett
 - Transmission to download the torrents
 - Calibre, to manage your ebook library (optional)

Make sure to have all of this before installing !

## Screenshots

### Download page
 ![Download page](https://i.imgur.com/CkgqXKZ.png)
### Settings page
 ![Settings page](https://i.imgur.com/ObU5AvS.png)


## Install

``` bash
# clone the repository
$ git clone https://github.com/truelossless/BusyLibrarian

# enter in the newly created directory
$ cd BusyLibrarian

# install dependencies
$ npm install

# build BusyLibrarian for production
$ npm run build
```

## Start BusyLibrarian server

```bash
$ npm start
```
You can now open a browser to [YOURCOMPUTERIP]:5298 and start configuring BusyLibrarian !

## Run BusyLibrarian server as a daemon
You probably want BusyLibrarian to run in the background and start when your server starts.
You can use pm2 to do that. It will also restart BusyLibrarian if it crashes.

```bash
# install pm2
$ npm install pm2 -g

# start BusyLibrarian with pm2
$ pm2 start npm -- start

# configure pm2 to run as a daemon
$ pm2 startup
[PM2] You have to run this command as root. Execute the following command:
      "[PM2 COMMAND FOR YOUR SYSTEM]"

# run the command that pm2 startup gave you
$ [PM2 COMMAND FOR YOUR SYSTEM]

# save all your current pm2 processes to run at startup
$ pm2 save
```
And now you're all set !

## Logs
Logs are available in the log.txt file, or in the web interface.

## Troubleshooting
If something isn't working, or you want to discuss about something, feel free to open an issue !

## Contributing
The code may be ugly, especially on the error handling side because [TODO: INSERT VALID REASON HERE]
So any help, or pull request is welcome !

## Future development
If you want a new feature, please request it. Otherwise I'm not planning on actively pushing commits here.

## Obligatory legal advice
This is a tool, and you are the master. Don't download ebooks if you don't have the right to do so.