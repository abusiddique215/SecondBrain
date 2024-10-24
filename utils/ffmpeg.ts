import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  await ffmpeg.load();
  return ffmpeg;
};

export const extractAudio = async (videoFile: File): Promise<Uint8Array> => {
  const ffmpegInstance = await loadFFmpeg();
  await ffmpegInstance.writeFile('input.mp4', await fetchFile(videoFile));

  await ffmpegInstance.exec(['-i', 'input.mp4', '-vn', '-acodec', 'libmp3lame', '-b:a', '128k', 'output.mp3']);

  const data = await ffmpegInstance.readFile('output.mp3');
  return data instanceof Uint8Array ? data : new TextEncoder().encode(data);
};

export const extractFrames = async (videoFile: File, frameCount: number): Promise<Uint8Array[]> => {
  const ffmpegInstance = await loadFFmpeg();
  await ffmpegInstance.writeFile('input.mp4', await fetchFile(videoFile));

  const frames: Uint8Array[] = [];
  for (let i = 0; i < frameCount; i++) {
    const time = (i / frameCount) * 100; // Extract frames at 0%, 20%, 40%, 60%, 80% of the video
    await ffmpegInstance.exec(['-i', 'input.mp4', '-vf', `select='eq(n,${i})'`, '-vframes', '1', `frame${i}.png`]);
    const frameData = await ffmpegInstance.readFile(`frame${i}.png`);
    frames.push(frameData instanceof Uint8Array ? frameData : new TextEncoder().encode(frameData));
  }

  return frames;
};
