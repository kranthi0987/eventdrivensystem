export interface JWTConfig {
    secret: string;
    expiresIn: string | number;
}

export interface AuthPayload {
    service: 'source' | 'bridge' | 'target';
    id: string;
}