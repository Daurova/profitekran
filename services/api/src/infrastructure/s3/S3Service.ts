import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

let s3Client: S3Client | null = null;

const getS3Client = (): S3Client => {
  if (s3Client) return s3Client;

  const endpoint = process.env['S3_ENDPOINT'];
  const region = process.env['S3_REGION'];
  const accessKeyId = process.env['S3_ACCESS_KEY'];
  const secretAccessKey = process.env['S3_SECRET_KEY'];
  const BUCKET = process.env['S3_BUCKET'];

  if (!endpoint || !region || !accessKeyId || !secretAccessKey || !BUCKET) {
    throw new Error('Не заданы переменные окружения для S3');
  }

  s3Client = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });

  return s3Client;
};

export const uploadVideo = async (fileBuffer: Buffer, fileName: string): Promise<string> => {
  const client = getS3Client();
  const bucket = process.env['S3_BUCKET']!;
  const key = `videos/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: 'video/mp4',
  });

  await client.send(command);
  return key;
};

export const getVideoUrl = (key: string): string => {
  if (key.startsWith('http')) return key;
  
  const bucket = process.env['S3_BUCKET'];
  return `https://s3.regru.cloud/${bucket}/${key}`;
};

export const deleteVideo = async (key: string): Promise<void> => {
  const client = getS3Client();
  const bucket = process.env['S3_BUCKET']!;
  
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  
  await client.send(command);
};