import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hall, HallDocument } from '../hall/schemas/hall.schema';

export interface QrPayload {
  v: number;
  hallId: string;
  iat: number;
}

@Injectable()
export class HallQrService {
  private readonly secret: string;

  constructor(
    @InjectModel(Hall.name) private readonly hallModel: Model<HallDocument>,
  ) {
    this.secret = process.env.QR_SIGNING_SECRET ?? '';
    if (!this.secret) {
      console.warn(
        'QR_SIGNING_SECRET is not set — QR code generation/verification will fail.',
      );
    }
  }

  /**
   * Generate a static HMAC-signed QR payload for a hall.
   * The payload is base64url-encoded JSON + signature.
   */
  async generateToken(hallId: string): Promise<{ qrPayload: string }> {
    const hall = await this.hallModel.findById(hallId).lean();
    if (!hall) {
      throw new NotFoundException('Hall not found');
    }

    const payload: QrPayload = {
      v: 1,
      hallId: String(hall._id),
      iat: Math.floor(Date.now() / 1000),
    };

    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const signature = this.sign(payloadB64);

    return { qrPayload: `${payloadB64}.${signature}` };
  }

  /**
   * Verify a scanned QR payload: check signature integrity.
   * Returns the decoded payload if valid; throws otherwise.
   */
  verifyToken(raw: string): QrPayload {
    if (!raw || !raw.includes('.')) {
      throw new BadRequestException('Invalid QR code format');
    }

    const [payloadB64, signature] = raw.split('.', 2);
    if (!payloadB64 || !signature) {
      throw new BadRequestException('Invalid QR code format');
    }

    // Constant-time signature comparison
    const expected = this.sign(payloadB64);
    const sigBuf = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');

    if (
      sigBuf.length !== expectedBuf.length ||
      !timingSafeEqual(sigBuf, expectedBuf)
    ) {
      throw new BadRequestException('Invalid QR code signature');
    }

    try {
      const json = Buffer.from(payloadB64, 'base64url').toString('utf-8');
      const payload = JSON.parse(json) as QrPayload;

      if (!payload.hallId || payload.v !== 1) {
        throw new BadRequestException('Invalid QR code payload');
      }

      return payload;
    } catch {
      throw new BadRequestException('Invalid QR code payload');
    }
  }

  /**
   * Assert that the verified QR payload hallId matches the session's hallId.
   */
  assertMatchesSession(
    sessionHallId: string,
    verifiedPayload: QrPayload,
  ): void {
    if (verifiedPayload.hallId !== sessionHallId) {
      throw new BadRequestException(
        'QR code does not match the assigned classroom for this session',
      );
    }
  }

  private sign(data: string): string {
    return createHmac('sha256', this.secret).update(data).digest('hex');
  }
}
