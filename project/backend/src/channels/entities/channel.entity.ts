import { Exclude, Transform } from 'class-transformer';
import { Channel, channelMode } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength,
	ValidateIf,
} from 'class-validator';

export class ChannelEntity implements Channel {
	id: number;
	createdAt: Date;
	updateAt: Date;

	@IsString()
	@IsNotEmpty()
	@MinLength(5)
	@MaxLength(30)
	@Transform(({ value }) => value?.trim())
	channelName: string;

	@ApiProperty({
		enum: [channelMode.PRIVATE, channelMode.PUBLIC, channelMode.PROTECTED],
	})
	@IsNotEmpty()
	mode: channelMode;

	@ApiHideProperty()
	// Permet d'appliquer les validator decorators QUE si le chan mode est en protected
	@ValidateIf((inst) => inst.mode === channelMode.PROTECTED)
	// Permet de transformer l'objet lors de la reponse only: enleve le pass field
	// (sinon on l'enleve dans la requete sauf que besoin pour
	// create / update un protected chan)
	@Exclude({ toPlainOnly: true })
	@IsNotEmpty()
	@MinLength(12)
	@Transform(({ value, obj }) =>
		obj?.mode !== channelMode.PROTECTED ? (value = null) : value.trim()
	)
	@MaxLength(20)
	password: string;

	constructor(partial: Partial<ChannelEntity>) {
		Object.assign(this, partial);
	}
}
