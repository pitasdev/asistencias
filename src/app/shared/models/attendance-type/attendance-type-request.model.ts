export interface AttendanceTypeRequest {
  readonly id: number | null,
  name: string,
  order: number,
  isActive: boolean,
  clubId: number
}
