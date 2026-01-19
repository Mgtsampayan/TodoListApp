import * as jose from 'jose';
import { env } from '../config/env.js';
import { Role } from '../../generated/client/client.ts';

const secret = new TextEncoder().encode(env.JWT_SECRET);

export interface JWTPayload {
    id: string;
    email: string;
    role: Role;
}

export async function generateToken(payload: JWTPayload): Promise<string> {
    const jwt = await new jose.SignJWT({
        id: payload.id,
        email: payload.email,
        role: payload.role,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(env.JWT_EXPIRES_IN)
        .sign(secret);

    return jwt;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jose.jwtVerify(token, secret);

        return {
            id: payload.id as string,
            email: payload.email as string,
            role: payload.role as Role,
        };
    } catch (error) {
        return null;
    }
}