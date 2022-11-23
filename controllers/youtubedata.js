const axios = require("axios");

const { YOUTUBE_API_KEY } = require("../setup/env");

const createYoutubeDataUrl = (youtubeId) => {
  return `https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails&id=${youtubeId}&key=${YOUTUBE_API_KEY}`;
};

const formatDuration = (unformattedDuration) => {
  let [minutes, seconds] = unformattedDuration.split("T")[1].split("M");

  seconds = seconds.substring(0, seconds.length - 1);

  return 60 * parseInt(minutes) + parseInt(seconds);
};

const getYoutubeVideoDuration = async (youtubeId) => {
  const result = await axios.get(createYoutubeDataUrl(youtubeId));

  if (result.data.items.length === 0) {
    throw Error(`YouTube video with id '${youtubeId}' wasn't found`);
  }

  const unformattedDuration = result.data.items[0].contentDetails.duration;

  return formatDuration(unformattedDuration);
};

module.exports = { getYoutubeVideoDuration };
