export interface ChannelDto {
	id: number,
	createdAt: string,
	updatedAt: string,
	channelName: string,
	mode: string,	
  nbUnread?: number,
};

export interface FriendListDto {
	id: number;
	username: string;
	avatarUrl: string;
	status?: boolean;
};

export interface socketMsgDto {
	creatorId: number;
	content: string;
	channelId: number;
}

export interface createChannelDto {
	channelName: string;
	mode: string;
	password?: string;
}

export interface UserOnChannelDto {
    id: number,
    createdAt: string,
    updatedAt: string,
    role: string,
    userId: number,
    channelId: number,
	username: string,
	channelName: string;
}

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
