export const static_myId: number = 1;

export interface MessageDto {
	creatorId: number;
    creatorName: string;
	content: string;
};

// owner et admin types a changer en userId
export interface ChanelDto {
    id: number,
    name: string,
};
