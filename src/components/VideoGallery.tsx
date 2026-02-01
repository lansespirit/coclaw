import { useRef, useState } from 'react';
import { Modal, ModalContent, ModalBody, Chip, Button, HeroUIProvider } from '@heroui/react';
import { LiteYouTubeEmbed } from './LiteYouTubeEmbed';
import { IconChevronLeft, IconChevronRight, IconPlay } from './icons';

interface Video {
  videoId: string;
  title: string;
  category: string;
  duration: string;
}

interface VideoGalleryProps {
  videos: Video[];
}

export const VideoGallery = ({ videos }: VideoGalleryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleVideoClick = (video: Video) => {
    setActiveVideo(video);
    setIsOpen(true);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <HeroUIProvider>
      <div className="flex items-end justify-between mb-16 px-0 md:px-0">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold mb-4">Video Library</h2>
          <p className="text-lg text-default-600 dark:text-default-500">
            Prefer watching? We have you covered with visual walkthroughs.
          </p>
        </div>
        <div className="hidden md:flex gap-4">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="w-12 h-12 rounded-full border border-divider flex items-center justify-center hover:bg-content1 transition-colors text-foreground"
          >
            <IconChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="w-12 h-12 rounded-full border border-divider flex items-center justify-center hover:bg-content1 transition-colors text-primary"
          >
            <IconChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative -mx-6 lg:-mx-12">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-8 px-6 lg:px-12 pb-12 scrollbar-hide snap-x"
        >
          {videos.map((video, index) => (
            <button
              key={index}
              type="button"
              className="flex-none w-[320px] md:w-[400px] snap-start space-y-4 group text-left outline-none"
              onClick={() => handleVideoClick(video)}
            >
              <div className="relative m-card-hover-lift rounded-3xl overflow-hidden shadow-2xl">
                {/* Custom Thumbnail Overlay */}
                <div className="aspect-video relative overflow-hidden bg-content2">
                  <img
                    src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors z-10">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300 group-hover:scale-110 shadow-xl">
                      <IconPlay className="w-8 h-8 text-white fill-current" aria-hidden="true" />
                    </div>
                  </div>
                  {/* Duration Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-white z-20">
                    {video.duration}
                  </div>
                </div>
              </div>
              <div>
                <Chip
                  size="sm"
                  variant="dot"
                  color="primary"
                  className="mb-2 border-0 uppercase font-bold tracking-tighter"
                >
                  {video.category}
                </Chip>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {video.title}
                </h3>
              </div>
            </button>
          ))}
        </div>

        {/* Edge Fades */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none z-20"></div>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none z-20"></div>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setActiveVideo(null);
        }}
        size="5xl"
        backdrop="blur"
        scrollBehavior="inside"
        disableAnimation
        onClose={() => setActiveVideo(null)}
        className="bg-background/95 backdrop-blur-2xl border border-divider shadow-2xl rounded-[32px] overflow-hidden m-4"
        classNames={{
          backdrop: 'bg-black/70 backdrop-blur-md',
          wrapper: 'z-[9999]',
          header: 'border-b border-divider',
          footer: 'border-t border-divider',
          closeButton:
            'z-50 top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full p-2 transition-all active:scale-95 text-white shadow-xl',
        }}
      >
        <ModalContent className="p-0">
          {(onClose) => (
            <ModalBody className="p-0 gap-0">
              {activeVideo && (
                <div className="flex flex-col">
                  {/* Cinema Header: Explicit Full Width Video */}
                  <div className="aspect-video w-full bg-black relative shadow-2xl overflow-hidden group">
                    <LiteYouTubeEmbed
                      key={activeVideo.videoId}
                      videoId={activeVideo.videoId}
                      title={activeVideo.title}
                    />
                    {/* Subtle overlay gradient */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>

                  {/* Info Panel: Premium Typography */}
                  <div className="p-8 md:p-14 bg-content1/5 border-t border-divider">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-3">
                          <Chip
                            color="primary"
                            variant="flat"
                            size="sm"
                            className="font-bold border-none bg-primary/10 text-primary uppercase tracking-widest text-[10px]"
                          >
                            {activeVideo.category}
                          </Chip>
                          <div className="h-1 w-1 rounded-full bg-default-300"></div>
                          <span className="text-default-400 font-semibold text-xs tracking-tight">
                            DURATION: {activeVideo.duration}
                          </span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                          {activeVideo.title}
                        </h2>

                        <p className="text-default-500 leading-relaxed text-lg max-w-2xl">
                          Explore the core concepts of{' '}
                          <span className="text-foreground font-semibold">{activeVideo.title}</span>
                          . This deep-dive covers the essential implementation steps, architectural
                          considerations, and production-ready configurations to help you scale your
                          OpenClaw assistant effectively.
                        </p>
                      </div>

                      <div className="flex flex-col gap-4 w-full md:w-auto">
                        <Button
                          color="primary"
                          radius="full"
                          size="lg"
                          className="font-bold px-10 shadow-lg shadow-primary/25 h-14 w-full md:w-64"
                        >
                          View Detailed Guide
                        </Button>
                        <Button
                          color="default"
                          variant="flat"
                          radius="full"
                          size="lg"
                          className="font-bold px-10 h-14 bg-default-100 hover:bg-default-200"
                          onPress={onClose}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </HeroUIProvider>
  );
};
