import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../../src/app.js';
import * as S3Service from '../../src/infrastructure/s3/S3Service.js';

// 1. Мокаем S3 (только функции S3!)
vi.mock('../../src/infrastructure/s3/S3Service.js', () => ({
  uploadVideo: vi.fn().mockResolvedValue('videos/fake-video.mp4'),
  getVideoUrl: vi.fn().mockReturnValue('https://profitekran-media.website.regru.cloud/videos/fake-video.mp4'),
}));

// 2. Мокаем music-metadata (ОТДЕЛЬНО, вне S3!)
vi.mock('music-metadata', () => ({
  parseBuffer: vi.fn().mockResolvedValue({
    format: { duration: 42 },
  }),
}));

describe('Upload API (Unit)', () => {
  let app: any;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  it('POST /upload should return S3 url', async () => {
    const form = new FormData();
    const blob = new Blob(['fake video content'], { type: 'video/mp4' });
    form.append('file', blob, 'test-video.mp4');

    const response = await app.inject({
      method: 'POST',
      url: '/upload',
      payload: form,
    });

    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    
    expect(S3Service.uploadVideo).toHaveBeenCalled();
    expect(payload.url).toContain('profitekran-media.website.regru.cloud');
  });
});