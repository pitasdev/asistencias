export interface User {
  readonly id: number | null,
  name: string,
  username: string,
  password?: string,
  hasDefaultPassword: boolean,
  roleId: number,
  clubId: number
}
