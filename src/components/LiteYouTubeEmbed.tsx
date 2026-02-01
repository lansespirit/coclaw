interface LiteYouTubeEmbedProps {
  videoId: string;
  title: string;
}

export const LiteYouTubeEmbed = ({ videoId, title }: LiteYouTubeEmbedProps) => {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <iframe
        width="100%"
        height="100%"
        // Use the privacy-enhanced domain to reduce tracking.
        src={`https://www.youtube-nocookie.com/embed/${videoId}/?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
};
