import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from 'nest-problem-details-filter';
import { AppModule } from '../src/app.module';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

const JEST_TIMEOUT = 30_000;

function extractCookies(
  setCookieHeader: string | string[] | undefined,
): string {
  if (!setCookieHeader) return '';
  const arr = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];
  if (arr.length === 0) return '';
  return arr.map((c: string) => c.split(';')[0]).join('; ');
}

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let secretPhrase: string;
  let cookies: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalFilters(
      new HttpExceptionFilter(app.get(HttpAdapterHost)),
      new PrismaExceptionFilter(),
    );

    await app.init();

    prisma = app.get(PrismaService);
  }, JEST_TIMEOUT);

  beforeEach(async () => {
    // Clean all tables before each test for a fresh state
    await prisma.refresh_tokens.deleteMany();
    await prisma.users.deleteMany();
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
  }, JEST_TIMEOUT);

  describe('Registration', () => {
    it(
      'POST /auth/register should create a user and return a 3-word secret phrase',
      async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .expect(201);

        expect(res.body).toHaveProperty('message', 'Register successful');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('secretPhrase');

        secretPhrase = res.body.data.secretPhrase as string;

        expect(secretPhrase.split(' ')).toHaveLength(3);
      },
      JEST_TIMEOUT,
    );

    it(
      'POST /auth/register should create a second user with a different phrase',
      async () => {
        const res1 = await request(app.getHttpServer())
          .post('/auth/register')
          .expect(201);
        const phrase1 = res1.body.data.secretPhrase as string;

        const res2 = await request(app.getHttpServer())
          .post('/auth/register')
          .expect(201);
        const phrase2 = res2.body.data.secretPhrase as string;

        expect(phrase2).not.toBe(phrase1);
      },
      JEST_TIMEOUT,
    );
  });

  describe('Login', () => {
    beforeEach(async () => {
      // Register a user first for login tests
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .expect(201);
      secretPhrase = res.body.data.secretPhrase as string;
    });

    it(
      'POST /auth/login should authenticate and set cookies',
      async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ secretPhrase })
          .expect(200);

        expect(res.body).toHaveProperty('message', 'Login successful');

        const cookieStr = extractCookies(res.headers['set-cookie']);
        expect(cookieStr).toContain('ssaeat=');
        expect(cookieStr).toContain('udssrt=');

        cookies = cookieStr;
      },
      JEST_TIMEOUT,
    );

    it(
      'POST /auth/login with wrong phrase should return 404',
      async () => {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ secretPhrase: 'wrong phrase test' })
          .expect(404);
      },
      JEST_TIMEOUT,
    );
  });

  describe('Protected endpoints', () => {
    beforeEach(async () => {
      // Register and login to obtain cookies
      const reg = await request(app.getHttpServer())
        .post('/auth/register')
        .expect(201);
      const phrase = reg.body.data.secretPhrase as string;

      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ secretPhrase: phrase })
        .expect(200);

      cookies = extractCookies(login.headers['set-cookie']);
    });

    it(
      'POST /auth/logout with valid cookies should succeed',
      async () => {
        expect(cookies).toBeTruthy();

        const res = await request(app.getHttpServer())
          .post('/auth/logout')
          .set('Cookie', cookies)
          .expect(200);

        expect(res.body).toHaveProperty('message', 'Logout successful');
      },
      JEST_TIMEOUT,
    );

    it(
      'POST /auth/refresh with an already-used token should fail',
      async () => {
        expect(cookies).toBeTruthy();

        // First refresh: succeeds and marks the original token as used
        const res = await request(app.getHttpServer())
          .post('/auth/refresh')
          .set('Cookie', cookies)
          .expect(200);

        // Extract the new cookies so we can meaningfully use them later
        const newCookies = extractCookies(res.headers['set-cookie']);
        expect(newCookies).toContain('ssaeat=');

        // Second refresh with the ORIGINAL (now-used) token: fails
        await request(app.getHttpServer())
          .post('/auth/refresh')
          .set('Cookie', cookies)
          .expect(401);
      },
      JEST_TIMEOUT,
    );

    it(
      'POST /auth/logout without cookies should return 401',
      async () => {
        await request(app.getHttpServer())
          .post('/auth/logout')
          .expect(401);
      },
      JEST_TIMEOUT,
    );
  });

  describe('Token rotation', () => {
    let rotatedCookies: string;

    beforeEach(async () => {
      // Register and login for each rotation test
      const reg = await request(app.getHttpServer())
        .post('/auth/register')
        .expect(201);
      const phrase = reg.body.data.secretPhrase as string;

      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ secretPhrase: phrase })
        .expect(200);

      rotatedCookies = extractCookies(login.headers['set-cookie']);
    });

    it(
      'POST /auth/login should create a new session',
      async () => {
        expect(rotatedCookies).toContain('ssaeat=');
      },
      JEST_TIMEOUT,
    );

    it(
      'POST /auth/refresh should rotate tokens and reject old ones',
      async () => {
        const oldCookies = rotatedCookies;

        const res = await request(app.getHttpServer())
          .post('/auth/refresh')
          .set('Cookie', rotatedCookies)
          .expect(200);

        expect(res.body).toHaveProperty(
          'message',
          'Tokens refreshed successfully',
        );

        const newCookies = extractCookies(res.headers['set-cookie']);
        expect(newCookies).toContain('ssaeat=');
        expect(newCookies).toContain('udssrt=');
        expect(newCookies).not.toBe(oldCookies);

        rotatedCookies = newCookies;

        // Old refresh token is now marked as "used" — should be rejected
        await request(app.getHttpServer())
          .post('/auth/refresh')
          .set('Cookie', oldCookies)
          .expect(401);
      },
      JEST_TIMEOUT,
    );
  });

  describe('Health check', () => {
    it(
      'GET /health should return 200 without auth',
      async () => {
        const res = await request(app.getHttpServer())
          .get('/health')
          .expect(200);

        expect(res.body).toHaveProperty('ok', true);
      },
      JEST_TIMEOUT,
    );
  });
});
