import "../styles/backgroundVideo.css";

export default function BackgroundVideo() {
  return (
    <>
      <video
        className="bg-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/Video.mp4" type="video/mp4" />
      </video>

      {/* 🌫️ White translucent shade */}
      <div className="bg-overlay" />
    </>
  );
}
