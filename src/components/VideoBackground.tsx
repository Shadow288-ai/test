export function VideoBackground() {
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/7593088-uhd_4096_1974_30fps.mp4" type="video/mp4" />
      </video>
      {/* Fade overlay for text readability */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80"></div>
    </div>
  );
}

