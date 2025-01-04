export interface UserSummitWin {
	winAttempt: {
		id: number;
		date: Date;
		userId: string;
		summitId: number;
		activityId: string;
		published: boolean;
	};
	username: string | null;
	profile: string | null;
	media: string | null;
}
