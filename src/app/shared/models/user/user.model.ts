export interface User {
  readonly id: number | null,
  name: string,
  username: string,
  hasDefaultPassword: boolean,
  role: {
    id: number,
    name: string
  },
  club: {
    id: number,
    name: string
  }
}
