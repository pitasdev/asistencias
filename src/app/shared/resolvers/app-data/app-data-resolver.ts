import { AttendanceTypeManager } from '@/app/domain/attendance-type/services/attendance-type-manager';
import { ClubManager } from '@/app/domain/club/services/club-manager';
import { ReasonManager } from '@/app/domain/reason/services/reason-manager';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { UserTeamsManager } from '@/app/domain/user-teams/services/user-teams-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

let loadedForUserId: number | null = null;
let inflight: Promise<boolean> | null = null;

export const appDataResolver: ResolveFn<boolean> = async () => {
  const teamManager = inject(TeamManager);
  const userManager = inject(UserManager);
  const attendanceTypeManager = inject(AttendanceTypeManager);
  const reasonManager = inject(ReasonManager);
  const userTeamsManager = inject(UserTeamsManager);
  const clubManager = inject(ClubManager);

  const user = userManager.activeUser();
  if (!user?.id) return false;

  if (loadedForUserId === user.id) return true;
  if (inflight) return inflight;

  inflight = (async () => {
    await Promise.all([
      teamManager.getTeamsByUserId(user.id!),
      teamManager.getTeamsByClubId(user.club.id),
      attendanceTypeManager.getAttendanceTypesByClubId(user.club.id),
      reasonManager.getReasonsByClubId(user.club.id),
      userTeamsManager.getUserTeamsByUserId(user.id!),
      clubManager.getClubById(user.club.id),
      clubManager.getSeasonsByClubId(user.club.id)
    ]);
    loadedForUserId = user.id!;
    return true;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
};
