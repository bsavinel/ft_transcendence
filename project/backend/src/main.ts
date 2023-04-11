import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './prisma-exception/prisma-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({ whitelist: true, transform: true })
	);

	app.useGlobalFilters(new PrismaExceptionFilter());

	const config = new DocumentBuilder()
		.setTitle('TRANSCENDENCE')
		.setDescription('Our 42 project ft_transcendence API description.')
		.setVersion('1.0')
		.addBearerAuth(
			{
				type: 'http',
				description: 'Enter access token for transandance',
				name: 'JWT',
				in: 'header',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
			'Transandance Token', // This name here is important for matching up with @ApiBearerAuth() in your controller!
		)
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	const options = {
		origin: ['http://localhost:3000', process.env.VITE_FRONT_URL],
		methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
		credentials: true,
	};

	app.use(cookieParser());
	app.enableCors(options);
	await app.listen(5000);
}
bootstrap();
