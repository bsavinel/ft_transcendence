import { PipeTransform, Injectable, ArgumentMetadata, NotAcceptableException } from "@nestjs/common";
import { Token, instanceOfToken } from "src/type/token.type";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenPipe implements PipeTransform<string> {
	constructor(private readonly jwt: JwtService) {}

	transform(value: string, metadata: ArgumentMetadata): Token {
		const content_token: any = this.jwt.decode(value);
		if (instanceOfToken(value))
			return content_token;
		throw new NotAcceptableException("authorization in request header is not good token")
	}
}
