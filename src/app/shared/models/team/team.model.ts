export interface Team {
  readonly id: number | null,
  name: string,
  order: number,
  isActive: boolean,
  club: {
    id: number,
    name: string
  }
}
