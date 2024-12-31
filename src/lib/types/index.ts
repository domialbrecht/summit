export interface LeaderboardData {
	userId: string;
	userName: string | null;
	userProfile: string | null;
	lastSummitWon: string | null;
	lastSummitId: number | null;
	wins: number;
}

export interface SummitWin {
	winAttempt: {
		id: number;
		date: Date;
		userId: string;
		summitId: number;
		activityId: string;
		published: boolean;
	};
	username: string | null;
}
