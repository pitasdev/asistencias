import { TeamRequest } from "../team/team-request.model";
import { UserRequest } from "./user-request.model";

export interface UserTeamsRequest {
  user: UserRequest,
  teams: TeamRequest[]
}
