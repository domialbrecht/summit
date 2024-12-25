export interface LeaderboardData {
	userId: string;
	userName: string | null;
	userProfile: string | null;
	lastSummitWon: string | null;
	lastSummitId: number | null;
	wins: number;
}
