// Simple utility to convert YouTube URL to embed URL
export const convertYouTubeUrlToEmbed = (url) => {
    if (!url) return null;

    // Extract video ID from various YouTube URL formats
    const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);

    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?controls=1&modestbranding=1`;
    }

    return null;
};

// Extract video ID for thumbnail
export const getYouTubeVideoId = (url) => {
    const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match && match[1] ? match[1] : null;
};
