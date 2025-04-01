import jwt, {  VerifyOptions } from 'jsonwebtoken';
import { JWTConfig, AuthPayload } from './types';

export class JWTService {
    private config: JWTConfig;

    constructor(config: JWTConfig) {
        this.config = config;
    }


    generateToken(payload: AuthPayload): string {
        // const options: SignOptions = {
        //     expiresIn: typeof this.config.expiresIn === 'string'
        //         ? this.config.expiresIn
        //         : `${this.config.expiresIn}s` // Convert numbers to string with 's' suffix
        // };

        return jwt.sign(payload, this.config.secret);
    }

    verifyToken(token: string): AuthPayload {
        const options: VerifyOptions = {
            algorithms: ['HS256']
        };

        try {
            return jwt.verify(
                token,
                this.config.secret,
                options
            ) as AuthPayload;
        } catch (error) {
            throw new Error(`JWT verification failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

export const jwtConfig: JWTConfig = {
    secret: process.env.JWT_SECRET || '1234567890',
    expiresIn: '1h' // Can also be number (in seconds)
};