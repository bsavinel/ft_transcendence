import {
	Injectable,
	CanActivate,
	ExecutionContext,
	BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { instanceOfToken, RequestWithAccess } from 'src/type/token.type';

@Injectable()
export class AccessGuard implements CanActivate {
	constructor(private readonly jwt: JwtService) {}

	//* C'est quoi un observable et pourquoi tu peut sa peut retourner un
	//* promesse car c'est chelou que se soit asyncrone
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = this.getRequest<RequestWithAccess>(context);
		try {
			var stringToken = this.getToken(request);
		} catch (error) {
			throw new BadRequestException('Bad authorization header');
		}
		try {
			var unpackToken = await this.jwt.verify(stringToken);
		} catch (error) {
			console.log(error);
			throw new BadRequestException("Token check failed");
		}

		if (!instanceOfToken(unpackToken) || unpackToken.type != 'access')
			throw new BadRequestException('Bad token send');
		if (unpackToken.expireAt >= new Date())
			throw new BadRequestException('Token expire');
		request.accessToken = unpackToken;
		return true;
	}

	private getRequest<T>(context: ExecutionContext): T {
		return context.switchToHttp().getRequest();
	}

	protected getToken(request: {
		headers: Record<string, string | string[]>;
	}): string {
		const authorization = request.headers['authorization'];
		if (!authorization || Array.isArray(authorization)) {
			throw new Error('Invalid Authorization Header');
		}
		console.log(authorization);
		const [type, token] = authorization.split(' ');
		if (type !== 'Bearer' || !token)
			throw new Error('Invalid Authorization Header');
		return token;
	}
}
