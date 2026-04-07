export interface SurveyParticipant {
  id: number;
  surveyId: number;
  userId: number;
  role: string;
  intakeData?: any;
  privacyChoice?: string;
  invitedBy?: number;
  joinedAt: string;
  completedAt?: string;
}
