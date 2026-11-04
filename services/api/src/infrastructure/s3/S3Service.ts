import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// Проверяем, что все переменные окружения заданы
const endpoint = process.env['S3_ENDPOINT'];
const region = process.env['S3_REGION'];
const accessKeyId = process.env['S3_ACCESS_KEY'];
const secretAccessKey = process.env['S3_SECRET_KEY'];
const BUCKET = process.env['S3_BUCKET'];

if (!endpoint || !region || !accessKeyId || !secretAccessKey || !BUCKET) {
  throw new Error('Не заданы переменные окружения для S3');
}

const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

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