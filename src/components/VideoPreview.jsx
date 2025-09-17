import React, { useState, useRef, useEffect } from 'react';
import { MdPlayArrow, MdPause, MdVolumeUp, MdFullscreen } from 'react-icons/md';

const VideoPreview = ({ videoFile, videoUrl, width = "100%", height = "200px" }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [videoSrc, setVideoSrc] = useState(null);

    useEffect(() => {
        if (videoFile) {
            const url = URL.createObjectURL(videoFile);
            setVideoSrc(url);
            return () => URL.revokeObjectURL(url);
        } else if (videoUrl) {
            setVideoSrc(videoUrl);
        }
    }, [videoFile, videoUrl]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleProgressChange = (e) => {
        const newTime = (e.target.value / 100) * duration;
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        }
    };

    if (!videoSrc) {
        return (
            <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
                <p className="text-gray-500">No video selected</p>
            </div>
        );
    }

    return (
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ width, height }}>
            <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Custom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                {/* Progress Bar */}
                <div className="mb-3">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={duration ? (currentTime / duration) * 100 : 0}
                        onChange={handleProgressChange}
                        className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={togglePlay}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
                        >
                            {isPlaying ? <MdPause size={20} /> : <MdPlayArrow size={20} />}
                        </button>

                        <div className="flex items-center space-x-2">
                            <MdVolumeUp size={16} />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => {
                                    const newVolume = parseFloat(e.target.value);
                                    setVolume(newVolume);
                                    if (videoRef.current) {
                                        videoRef.current.volume = newVolume;
                                    }
                                }}
                                className="w-20 h-1"
                            />
                        </div>

                        <div className="text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    <button
                        onClick={toggleFullscreen}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
                    >
                        <MdFullscreen size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoPreview;
