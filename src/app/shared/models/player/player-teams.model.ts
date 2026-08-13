import { Team } from "../team/team.model"
import { Player } from "./player.model"

export interface PlayerTeams {
  player: Player,
  teams: Team[]
}
