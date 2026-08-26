import { AttendanceTypeManager } from '@/app/domain/attendance-type/services/attendance-type-manager';
import { ClubManager } from '@/app/domain/club/services/club-manager';
import { ReasonManager } from '@/app/domain/reason/services/reason-manager';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { UserTeamsManager } from '@/app/domain/user-teams/services/user-teams-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

export const appDataResolver: ResolveFn<boolean> = async (route, state) => {
  const teamManager = inject(TeamManager);
  const userManager = inject(UserManager);
  const attendanceTypeManager = inject(AttendanceTypeManager);
  const reasonManager = inject(ReasonManager);
  const userTeamsManager = inject(UserTeamsManager);
  const clubManager = inject(ClubManager);
  
  if (!userManager.activeUser()) return false;

  await teamManager.getTeamsByUserId(userManager.activeUser()?.id!);
  await teamManager.getTeamsByClubId(userManager.activeUser()?.club.id!);
  await attendanceTypeManager.getAttendanceTypesByClubId(userManager.activeUser()?.club.id!);
  await reasonManager.getReasonsByClubId(userManager.activeUser()?.club.id!);
  await userTeamsManager.getUserTeamsByUserId(userManager.activeUser()?.id!);
  await clubManager.getClubById(userManager.activeUser()?.club.id!);
  await clubManager.getSeasonsByClubId(userManager.activeUser()?.club.id!);
  
  return true;
};
