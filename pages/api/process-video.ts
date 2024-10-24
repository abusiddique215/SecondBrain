import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { extractAudio, extractFrames } from '../../utils/ffmpeg';

export const config = {
  api: {
    bodyParser: false,
  },
};

type ProcessedResult = {
  filename: string;
  audioPath: string;
  framePaths: string[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProcessedResult | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm({
      uploadDir: path.join(process.cwd(), 'tmp'),
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error processing upload' });
      }

      const fileArray = files.file;
      if (!fileArray || fileArray.length === 0) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

      const filename = file.originalFilename || 'unknown';
      const filepath = file.filepath;

      console.log('Processing video:', filename);

      // Extract audio
      const audioData = await extractAudio(new File([fs.readFileSync(filepath)], filename));
      const audioPath = path.join(process.cwd(), 'tmp', `${path.parse(filename).name}_audio.mp3`);
      fs.writeFileSync(audioPath, audioData);

      // Extract frames
      const frames = await extractFrames(new File([fs.readFileSync(filepath)], filename), 5);
      const framePaths = frames.map((frameData, index) => {
        const framePath = path.join(process.cwd(), 'tmp', `${path.parse(filename).name}_frame${index + 1}.png`);
        fs.writeFileSync(framePath, frameData);
        return framePath;
      });

      res.status(200).json({
        filename,
        audioPath,
        framePaths,
      });
    });
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
