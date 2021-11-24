import styled from "@emotion/styled";
import { useEffect, useRef } from "react";

export const Video = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const snapshot = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, 300, 300);
    ctx.font = "48px serif";
    ctx.fillStyle = "#fff";
    ctx.fillText("Hello world", 40, 50);
    ctx.fillText("Bottom text", 30, 300 - 10);
    drawCircle(ctx, getRandom(0, 300), getRandom(0, 300), 5);
    requestAnimationFrame(snapshot);
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      })
      .then((stream) => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        snapshot();
      });
  }, [snapshot]);

  const handleClick = () => {
    console.log(videoRef.current?.src);
    console.log(videoRef.current?.srcObject);
  };

  return (
    <Container>
      <VideoElement
        height={300}
        width={300}
        autoPlay
        ref={videoRef}
        controls
        muted
        loop
        playsInline
        hidden
        onPause={() => videoRef.current?.play()}
      />
      <Canvas height={300} width={300} ref={canvasRef} />
      <button onClick={handleClick}>e</button>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  min-height: 100vh;
  flex-wrap: wrap;
`;

const VideoElement = styled.video`
  background-color: white;
  transform: scale(-1, 1);
`;

const Canvas = styled.canvas`
  background-color: white;
`;

function getRandom(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#ccc";
  ctx.fill();
};
