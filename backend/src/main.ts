import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './prisma-exception/prisma-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	//* Swagger setup
	try {
		const readYamlFile = require('read-yaml-file');
		const document = (await readYamlFile(
			'./swagger.yaml'
		)) as OpenAPIObject;
		SwaggerModule.setup('api', app, document);
	} catch (e) {
		console.log("Swagger file doesn't exist. Skipping swagger setup.");
	}

	//* Cors setup
	const options = {
		origin: ['http://localhost:3000', process.env.VITE_FRONT_URL],
		methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
		credentials: true,
	};
	app.enableCors(options);

	//* Global setup
	app.useGlobalPipes(
		new ValidationPipe({ whitelist: true, transform: true })
	);
	app.useGlobalFilters(new PrismaExceptionFilter());
	app.use(cookieParser());
	await app.listen(5000);
}
bootstrap();
