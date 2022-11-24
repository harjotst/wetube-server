const { YOUTUBE_API_KEY } = require("../setup/env");

const createYoutubeDataUrl = (youtubeId) => {
  return `https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails&id=${youtubeId}&key=${YOUTUBE_API_KEY}`;
};

const formatDuration = (unformattedDuration) => {
  const secondsMinutesHours = unformattedDuration
    .substring(2)
    .replace(/H|M|S/gi, " ")
    .trim()
    .split(" ");

  let videoDurationInSeconds = 0;

  if (secondsMinutesHours.length === 2) {
    videoDurationInSeconds =
      parseInt(secondsMinutesHours[0]) * 60 + parseInt(secondsMinutesHours[1]);
  } else {
    videoDurationInSeconds =
      parseInt(secondsMinutesHours[0]) * 3600 +
      parseInt(secondsMinutesHours[1]) * 60 +
      parseInt(secondsMinutesHours[2]);
  }

  return videoDurationInSeconds;
};

const getYoutubeVideoDuration = async (youtubeId) => {
  const response = await fetch(createYoutubeDataUrl(youtubeId));

  const data = await response.json();

  if (data.items.length === 0) {
    throw Error(`YouTube video with id '${youtubeId}' wasn't found`);
  }

  const unformattedDuration = data.items[0].contentDetails.duration;
  
  return formatDuration(unformattedDuration);
};

module.exports = { getYoutubeVideoDuration };
