import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { MdPlayCircleFilled } from 'react-icons/md';

const YouTubeVideoPreview = ({ url, width = '100%', height = '200px', autoPlay = false }) => {
    const [showPlayer, setShowPlayer] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [isValidYouTube, setIsValidYouTube] = useState(false);

    useEffect(() => {
        if (!url) {
            setThumbnailUrl(null);
            setIsValidYouTube(false);
            return;
        }

        // Extract video ID from various YouTube URL formats
        const getYouTubeVideoId = (url) => {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        };

        const videoId = getYouTubeVideoId(url);
        if (videoId) {
            setIsValidYouTube(true);
            // Use high quality thumbnail
            setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
        } else {
            setIsValidYouTube(false);
            setThumbnailUrl(null);
        }
    }, [url]);

    const handlePlay = () => {
        setShowPlayer(true);
    };

    if (!url || !isValidYouTube) {
        return (
            <div
                className="flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
                style={{ width, height }}
            >
                <p className="text-gray-500 text-sm">Invalid YouTube URL</p>
            </div>
        );
    }

    return (
        <div className="relative rounded-lg overflow-hidden shadow-sm" style={{ width, height }}>
            {!showPlayer ? (
                <div
                    className="relative cursor-pointer group"
                    onClick={handlePlay}
                    style={{ width, height }}
                >
                    {/* Thumbnail Image */}
                    <img
                        src={thumbnailUrl}
                        alt="YouTube Video Thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback to medium quality thumbnail
                            e.target.src = `https://img.youtube.com/vi/${url.match(/[?&]v=([^&]+)/)[1]}/mqdefault.jpg`;
                        }}
                    />

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all duration-300"></div>

                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <MdPlayCircleFilled
                            className="text-white text-6xl group-hover:text-red-500 group-hover:scale-110 transition-all duration-300 drop-shadow-lg"
                        />
                    </div>

                    {/* YouTube logo */}
                    <div className="absolute bottom-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                        YouTube
                    </div>
                </div>
            ) : (
                <div className="relative" style={{ width, height }}>
                    <ReactPlayer
                        url={url}
                        playing={autoPlay}
                        controls={true}
                        width="100%"
                        height="100%"
                        onEnded={() => setShowPlayer(false)}
                    />

                    {/* Close button */}
                    <button
                        onClick={() => setShowPlayer(false)}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};

export default YouTubeVideoPreview;
