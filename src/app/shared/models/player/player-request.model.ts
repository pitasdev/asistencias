export interface PlayerRequest {
  readonly id: number | null,
  name: string,
  lastName: string,
  isActive: boolean,
  clubId: number
}
