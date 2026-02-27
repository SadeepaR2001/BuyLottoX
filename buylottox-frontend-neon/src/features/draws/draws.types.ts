export type Draw = {
  id: string
  title: string
  drawAt: string
  status: 'OPEN' | 'CLOSED'
  winningNumbers?: number[]
}
