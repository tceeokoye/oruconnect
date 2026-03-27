'use client';

import React from 'react';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';
import { Volume2, Maximize, Play } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
}

export function VideoPlayer({
  url,
  title = 'Video Player',
  poster,
  controls = true,
  width = '100%',
  height = '100%',
}: VideoPlayerProps) {
  const [playing, setPlaying] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      className="relative w-full bg-black rounded-xl overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Video Container */}
      <div className="relative w-full aspect-video bg-black">
        <ReactPlayer
          url={url}
          playing={playing}
          light={poster}
          controls={controls}
          width="100%"
          height="100%"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          config={{
            youtube: {
              playerVars: { showinfo: 1 },
            },
            file: {
              attributes: {
                controlsList: 'nodownload',
              },
            },
          }}
        />
      </div>

      {/* Overlay Controls */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPlaying(!playing)}
              className="p-4 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm"
            >
              {!playing ? (
                <Play size={32} className="text-white fill-white" />
              ) : (
                <div className="text-white">Pause</div>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      {title && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-white font-semibold">{title}</h3>
        </motion.div>
      )}
    </motion.div>
  );
}

interface AnimatePresenceProps {
  children: React.ReactNode;
}

export function AnimatePresence({ children }: AnimatePresenceProps) {
  return <>{children}</>;
}

export default VideoPlayer;
