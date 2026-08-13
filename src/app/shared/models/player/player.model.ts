export interface Player {
  readonly id: number | null,
  name: string,
  lastName: string,
  isActive: boolean,
  club: {
    id: number,
    name: string
  } 
}
