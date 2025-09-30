import { Player } from "./player.model";
import { Team } from "./team.model";

export interface PlayerTeams {
  player: Player,
  teams: Team[]
}
