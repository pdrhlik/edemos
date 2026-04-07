export interface Statement {
  id: number;
  surveyId: number;
  text: string;
  type: string;
  status: string;
  authorId?: number;
  moderatedBy?: number;
  moderatedAt?: string;
  createdAt: string;
}
