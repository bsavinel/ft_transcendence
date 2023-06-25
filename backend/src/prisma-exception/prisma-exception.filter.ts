import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Socket } from 'dgram';

@Catch(
	Prisma.PrismaClientKnownRequestError,
	Prisma.PrismaClientValidationError,
	Prisma.PrismaClientUnknownRequestError
)
export class PrismaExceptionFilter extends BaseExceptionFilter {
	catch(
		exception:
			| Prisma.PrismaClientKnownRequestError
			| Prisma.PrismaClientUnknownRequestError
			| Prisma.PrismaClientValidationError,
		host: ArgumentsHost
	) {
		if (host.getType() === 'ws') {
			const client: Socket = host.switchToWs().getClient();
			client.emit('error', exception.message);
			return;
		}

		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = HttpStatus.BAD_REQUEST;
		response.status(status).json({
			statusCode: status,
			message: 'Prisma exception: ' + exception.message,
		});
	}
}
