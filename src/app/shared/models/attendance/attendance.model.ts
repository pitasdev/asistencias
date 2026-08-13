export interface Attendance {
  readonly id: number | null;
  hasAttended: boolean;
  date: string;
  isAdditional: boolean;
  reasonDescription: string | null;
  attendanceType: {
    id: number;
    name: string;
  };
  reason: {
    id: number;
    name: string;
  } | null;
  player: {
    id: number;
    name: string;
    lastName: string;
  };
  team: {
    id: number;
    name: string;
  };
  club: {
    id: number;
    name: string;
  };
}
