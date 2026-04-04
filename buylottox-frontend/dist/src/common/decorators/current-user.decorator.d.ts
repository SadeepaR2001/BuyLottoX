export type JwtUser = {
    sub: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    name: string;
};
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
