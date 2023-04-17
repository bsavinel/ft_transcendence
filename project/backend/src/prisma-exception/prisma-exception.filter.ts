import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
	catch(
		exception:
			| Prisma.PrismaClientKnownRequestError
			| Prisma.PrismaClientValidationError,
		host: ArgumentsHost
	) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		console.log('EXCEPTION filter catch');

		if (exception instanceof Prisma.PrismaClientValidationError) {
			const status = HttpStatus.BAD_REQUEST;
			response.status(status).json({
				statusCode: status,
				message: 'prisma validation exc: ' + exception.message,
			});
			return;
		}

		//TODO: tester et catcher tout type d'erreur pour pas faire de 500
		switch (exception.code) {
			case 'P2003': {
				const status = HttpStatus.BAD_REQUEST;
				response.status(status).json({
					statusCode: status,
					message: 'prisma known  exc: ' + exception.message,
				});
				break;
			}
			case 'P2025': {
				const status = HttpStatus.NOT_FOUND;
				response.status(status).json({
					statusCode: status,
					message: 'prisma known  exc: ' + exception.message,
				});
				break;
			}
			case 'P2002': {
				const status = HttpStatus.CONFLICT;
				response.status(status).json({
					statusCode: status,
					message: 'prisma known  exc: ' + exception.message,
				});
				break;
			}
			default: {
				console.log('PRISMA FILTER DEFAULT => UNHANDLED');
				super.catch(exception, host);
				break;
			}
		}
	}
}
