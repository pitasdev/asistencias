export interface Season {
  readonly id: number | null;
  name: string;
  currentSeason: boolean;
  club: {
    id: number,
    name: string
  }
}
