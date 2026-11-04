import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: process.env['S3_ENDPOINT'],
  region: process.env['S3_REGION'],
  credentials: {
    accessKeyId: process.env['S3_ACCESS_KEY']!,
    secretAccessKey: process.env['S3_SECRET_KEY']!,
  },
  forcePathStyle: true,
});

const BUCKET = process.env['S3_BUCKET'];

// Загрузка видео в S3
export const uploadVideo = async (fileBuffer: Buffer, fileName: string): Promise<string> => {
  const key = `videos/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: 'video/mp4',
  });

  await s3Client.send(command);
  return key;
};

// Получение публичной ссылки
export const getVideoUrl = (key: string): string => {
  return `https://${BUCKET}.website.regru.cloud/${key}`;
};