import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../../src/app.js';
import * as S3Service from '../../src/infrastructure/s3/S3Service.js';
import jwt from 'jsonwebtoken';

// Мокаем S3
vi.mock('../../src/infrastructure/s3/S3Service.js', () => ({
  uploadVideo: vi.fn().mockResolvedValue('videos/fake-video.mp4'),
  getVideoUrl: vi.fn().mockReturnValue('https://profitekran-media.website.regru.cloud/videos/fake-video.mp4'),
}));

// Мокаем music-metadata
vi.mock('music-metadata', () => ({
  parseBuffer: vi.fn().mockResolvedValue({
    format: { duration: 42 },
  }),
}));

describe('Upload API (Unit)', () => {
  let app: any;
  let token: string;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
    
    // Генерируем валидный токен для теста
    token = jwt.sign(
      { userId: 'test-user', tenantId: 'default', role: 'ADMIN' },
      process.env['JWT_SECRET'] || 'super-secret-key-for-dev',
      { expiresIn: '1h' }
    );
  });

  it('POST /upload should return S3 url with valid token', async () => {
    const form = new FormData();
    const blob = new Blob(['fake video content'], { type: 'video/mp4' });
    form.append('file', blob, 'test-video.mp4');

    const response = await app.inject({
      method: 'POST',
      url: '/upload',
      payload: form,
      headers: {
        authorization: `Bearer ${token}`, // <-- Передаем токен
      },
    });

    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    
    expect(S3Service.uploadVideo).toHaveBeenCalled();
    expect(payload.url).toContain('profitekran-media.website.regru.cloud');
  });

  it('POST /upload should return 401 without token', async () => {
    const form = new FormData();
    form.append('file', new Blob(['data'], { type: 'video/mp4' }), 'test.mp4');

    const response = await app.inject({
      method: 'POST',
      url: '/upload',
      payload: form,
    });

    expect(response.statusCode).toBe(401); // <-- Проверяем защиту
  });
});