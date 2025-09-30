import { Team } from "./team.model";
import { User } from "./user.model";

export interface UserTeams {
  user: User,
  teams: Team[]
}
