// @packages
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const moment = require('moment');
dotenv.config();

// @scripts
const apiResources = require('./api-resources.json');

// @constants
const API_KEY = process.env.API_KEY;

const deletedVideos = [];
const playlistId = process.argv[2];
const playlistItems = [];
let playlistTitle = null;
let playlistAuthor = null;
let playlistFullTitle = null;
let positionChecker = 0;

if (!playlistId) {
    console.log('Please enter playlistId argument');
    process.exit(0);
}

const generatePlaylistReport = async () => {
    await getPlaylistItemsTitle(playlistId, true);

    const currentTime = moment().format('YYYY-MM-DD__HH-mm-ss');
    const playlistCleanTitle = playlistTitle.toLowerCase().replace(/[^A-Z0-9]+/ig, "-");
    const fileName = `${__dirname}/${playlistCleanTitle}-report-${currentTime}.txt`;
    const writeStream = fs.createWriteStream(fileName);

    writeStream.on('error', (err) => {
        console.log('There was an error creating file:', err);
        process.exit(0);
    });

    writeStream.write(`${playlistFullTitle}\n`);
    playlistItems.forEach(item => writeStream.write(`${item}\n`));

    if (deletedVideos.length > 0) {
        writeStream.write('\nThere are deleted or unavailable videos:\n');
        deletedVideos.forEach(item => writeStream.write(`${item}\n`));
    }

    console.log('REPORT FINISHED');
    console.log(`File saved at ${fileName}`);
};

const getPlaylistItemsTitle = async (
    playlistId,
    getPlayListName,
    pageToken = null,
    totalResults = 0,
    resultsPerPageCounter = 0,
    part = 'snippet',
    maxResults = 50
) => {
    try {
        if (resultsPerPageCounter > totalResults )
            return;

        if (getPlayListName) {
            const { data } = await axios.get(apiResources.getPlaylists, {
                params: {
                    id: playlistId,
                    key: API_KEY,
                    part
                }
            });
            const { snippet } = data.items[0];
            playlistTitle = snippet.title;
            playlistAuthor = snippet.channelTitle;
            playlistFullTitle =`${snippet.title} by ${snippet.channelTitle}`;
        }
        
        const { data } = await axios.get(apiResources.getPlaylistItems, {
            params: {
                key: API_KEY,
                maxResults,
                pageToken,
                part,
                playlistId
            }
        });
        const items = data.items;
        totalResults = data.pageInfo.totalResults;

        items.forEach(item => {
            const itemPosition = item.snippet.position;
            const itemResult = `${itemPosition + 1}: ${item.snippet.title}`;

            if (item.snippet.title === 'Deleted video' || item.snippet.title === 'Private video')
                deletedVideos.push(itemResult);
            
            if (itemPosition - positionChecker >= 2)
                deletedVideos.push(`${itemPosition}:`);

            positionChecker = item.snippet.position;
            playlistItems.push(itemResult);
        });
        
        resultsPerPageCounter += maxResults;
        await getPlaylistItemsTitle(playlistId, false, pageToken = data.nextPageToken, totalResults, resultsPerPageCounter);
    } catch(error) {
        Promise.reject(error);
    }
};

generatePlaylistReport();
