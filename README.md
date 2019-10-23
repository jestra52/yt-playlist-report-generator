# YouTube Playlist Report Generator
A YouTube playlist report generator to check your playlist items status

## Setup
```shell
$ git clone https://github.com/jestra52/yt-playlist-report-generator.git
$ cd yt-playlist-report-generator
$ npm install
```

You also need to add a .env file with your Google API key:
> If you do not have Google API key check [this link](https://support.google.com/googleapi/answer/6158862) for more information

```env
API_KEY=<Your Google API key>
```

## Run
```shell
$ npm start -- <playlist id> <custom filename>
```

Or

```shell
$ node app.js <playlist id> <custom filename>
```
