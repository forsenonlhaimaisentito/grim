const swap = (arr: unknown[], l: number, r: number) => {
  const tmp = arr[l]
  arr[l] = arr[r]
  arr[r] = tmp
}

export const shuffleArray = (data: unknown[]) => {
  for (let i = 0; i < data.length; i++) {
    const r = Math.floor(Math.random() * (data.length - 1))
    swap(data, i, r)
  }
}
