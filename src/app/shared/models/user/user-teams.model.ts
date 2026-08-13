import { Team } from "../team/team.model";
import { User } from "./user.model";

export interface UserTeams {
  user: User,
  teams: Team[]
}
