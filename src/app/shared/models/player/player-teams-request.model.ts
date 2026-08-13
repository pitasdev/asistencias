import { TeamRequest } from "../team/team-request.model"
import { PlayerRequest } from "./player-request.model"

export interface PlayerTeamsRequest {
  player: PlayerRequest,
  teams: TeamRequest[]
}
