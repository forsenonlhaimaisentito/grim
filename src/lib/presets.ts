export interface VisualizerPreset {
  name: string
  code: string
  size: number
  skip: number
}

export const presets: VisualizerPreset[] = [
  {
    name: "Bubble Sort",
    code: `\
const swap = (items, leftIndex, rightIndex) => {
  var temp = items[leftIndex];
  items[leftIndex] = items[rightIndex];
  items[rightIndex] = temp;
};

const oneRound = async () => {
  let sorted = true;
  for (let i=0; i<data.length-1; i++) {
    if (data[i] > data[i+1]){
      sorted=false;
      swap(data, i, i+1);
    }
  }
  return sorted;
};

while (!(await oneRound())){
  await snapshot();
}
`,
    size: 32,
    skip: 1
  }, {
    name: "Quicksort",
    code: `\
const partition = (arr, start, end) => {
  const pivotValue = arr[end];
  let pivotIndex = start;
  for (let i = start; i < end; i++) {
    if (arr[i] < pivotValue) {
      [arr[i], arr[pivotIndex]] = [arr[pivotIndex], arr[i]];
      pivotIndex++;
    }
  }

  [arr[pivotIndex], arr[end]] = [arr[end], arr[pivotIndex]]
  return pivotIndex;
}

const quickSort = async (arr, start, end) => {
  if (start >= end) return;
  let index = await partition(arr, start, end);
  await snapshot();
  await quickSort(arr, start, index - 1);
  await quickSort(arr, index + 1, end);
}

await quickSort(data, 0, data.length-1);
`,
    size: 32,
    skip: 1
  }
]
