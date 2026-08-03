export interface Attendance {
  readonly id: number | null,
  hasAttended: boolean,
  date: string,
  isAdditional: boolean,
  reasonDescription: string | null,
  attendanceTypeId: number,
  reasonId: number | null,
  playerId: number,
  teamId: number,
  clubId: number
}
