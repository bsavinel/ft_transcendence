import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	
	
	const options = {
		origin: ["http://localhost:3000", process.env.VITE_FRONT_URL],
		methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
		credentials: true,
	};
	
	const config = new DocumentBuilder()
	.setTitle("Cats example")
	.setDescription("The cats API description")
	.setVersion("1.0")
	.addTag("cats")
	.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, document);

	app.use(cookieParser());
	app.enableCors(options);
	await app.listen(5000);
}
bootstrap();
