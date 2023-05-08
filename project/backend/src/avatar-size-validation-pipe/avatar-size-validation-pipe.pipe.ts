import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class AvataSizeValidationPipe implements PipeTransform {
	transform(value: any, metadata: ArgumentMetadata) {
		const oneKb = 1000;
		return value.size < oneKb;
	}
}
