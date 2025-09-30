export interface Reason {
  readonly id: number | null,
  name: string,
  order: number,
  requiresDescription: boolean,
  isActive: boolean,
  clubId: number
}
