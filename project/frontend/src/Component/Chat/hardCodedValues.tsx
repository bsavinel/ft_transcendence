export interface MessageDto {
	user: string;
	message: string;
	// date: Date;
};

// owner et admin types a changer en userId
export interface ChanelDto {
    name: string,
    id: number,
    messages: MessageDto[],
    owner: string,
    admins: string[],
};

export const lalala: MessageDto[] = [
    { user: 'Jean', message: 'Bonjouuuuur' },
    { user: 'Nieh', message: 'jQuery' },
	{ user: 'Me', message: 'lalalal' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Paul', message: 'Vue.js' },
];

export const secMsgList: MessageDto[] = [
    { user: 'Jean', message: 'SECOND' },
    { user: 'Nieh', message: 'jQuery' },
	{ user: 'Me', message: 'lalalal' },
	{ user: 'Me', message: 'lalalal' },
	{ user: 'Me', message: 'lalalal' },
	{ user: 'Me', message: 'lalalal' },
	{ user: 'Me', message: 'lalalal' },
    { user: 'Corinne', message: 'React' },
    { user: 'Paul', message: 'Vue.js' },
];

export const hardCodeMsgList: MessageDto[] = [
    { user: 'Jean', message: 'Angular Jdfa kkkkk jjjjj aaaa dfw idfadjafldaffffffff hdfadfha fsjgh sjdhfdhfgjk sdhfgsdfg sdfgsdfgsdfgrtsdfgvcx cvbwawrpsdg dfgsdfg;rg dsfdahfadfh adfah hihihihihihihih lalalalal hehehehehe ninininin' },
    { user: 'Jean', message: 'jQuery' },
	{ user: 'Me', message: 'Polymer' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Corinne', message: 'React' },
    { user: 'Paul', message: 'Vue.js' },
];

export const hardCodeChannelList: ChanelDto[] = [
    {name: 'owner', id: 0, messages: hardCodeMsgList, owner: 'Me', admins: ['Me', 'Corinne']},
    {name: 'lambda', id: 1, messages: lalala, owner: 'Jean', admins: ['Jean', 'Corinne']},
    {name: 'admin', id: 2, messages: secMsgList, owner: 'Jean', admins: ['Jean', 'Me']},
    {name: 'lala hihih cest trop long comme nom de channel euh', id: 3, messages: [], owner: 'Jean', admins: ['Jean', 'Corinne']},
    {name: 'et la cest trop long et plein milieu mooooooooooooooooooooooooooooooooooooot', id: 4, messages: [], owner: 'Jean', admins: ['Jean', 'Corinne']},
    {name: 'test', id: 5, messages: [], owner: 'Jean', admins: ['Me', 'Corinne']},
    {name: 'test', id: 6, messages: [], owner: 'Jean', admins: ['Me', 'Corinne']},
    {name: 'overflowing y', id: 7, messages: [], owner: 'Jean', admins: ['Jean', 'Corinne']},
    {name: 'test', id: 8, messages: [], owner: 'Jean', admins: ['Jean', 'Corinne']},
    {name: 'test', id: 9, messages: [], owner: 'Jean', admins: ['Jean', 'Corinne']},
];
