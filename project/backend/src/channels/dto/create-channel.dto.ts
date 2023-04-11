import { PickType } from '@nestjs/swagger';
import { ChannelEntity } from '../entities/channel.entity';

// Grace au 'whitelist: true' dans le main.ts validationPipe, seulement
// les proprietes qui ont un validation decorator seront prise en compte. Cad que les props qu'on ne liste pas ici ou qu'on liste mais
// sans vd, seront remove de la requete par le validation pipe avant
// meme d'arriver au route handler.

export class CreateChannelDto extends PickType(ChannelEntity, [
	'channelName',
	'mode',
	'password',
] as const) {}
