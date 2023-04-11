import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { instanceOfToken, RequestWithRefresh } from 'src/type/token.type';
import { TokenService } from 'src/oauth/token.service';

@Injectable()
export class RefreshGuard implements CanActivate {
	constructor(
		private readonly jwt: JwtService,
		private readonly tokenManager: TokenService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: RequestWithRefresh = context.switchToHttp().getRequest();
		const oldRefreshToken = request.cookies.refreshToken;
		if (!oldRefreshToken) {
			throw new ForbiddenException(
				'Please put your refresh token in cookie with the name [refreshToken]'
			);
		}

		//? vaut-il pas mieux mettre un .catch dans ce cas
		try {
			var unpack = await this.jwt.verify(oldRefreshToken);
		} catch {
			throw new ForbiddenException('Key of the token is invalide');
		}

		if (!instanceOfToken(unpack) || unpack.type != 'refresh')
			throw new ForbiddenException('Bad type of token');

		if (unpack.expireAt > new Date())
			throw new UnauthorizedException('Token expire');

		if (!(await this.tokenManager.ExistRefreshToken(unpack.code))) {
			await this.tokenManager.disconectFromEveryWhere(unpack.userId);
			throw new ForbiddenException(
				'Refresh token steel, the user has disconect from everywere'
			);
		}

		request.refreshToken = unpack;
		return true;
	}
}
