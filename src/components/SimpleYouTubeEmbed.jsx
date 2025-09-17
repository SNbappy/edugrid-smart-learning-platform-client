import React, { useState } from 'react';

const SimpleYouTubeEmbed = ({ embedUrl, title = "YouTube Video", height = "315" }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    if (!embedUrl) {
        return <div className="bg-gray-100 p-4 rounded">Invalid YouTube URL</div>;
    }

    return (
        <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%', height: 0 }}>
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="text-gray-500">Loading video...</div>
                </div>
            )}
            <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={embedUrl}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoaded(true)}
            />
        </div>
    );
};

export default SimpleYouTubeEmbed;
