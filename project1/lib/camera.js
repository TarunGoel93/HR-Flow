export function captureFrame(video){
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2D context");
  ctx.drawImage(video, 0, 0);

  return canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
}
