import {Snapshooter} from "@/lib/runner";

export interface Renderer {
  render(data: number[]): Promise<void>

  renderNow(data: number[]): void
}

export class RenderingSnapshooter implements Snapshooter {
  private readonly renderer: Renderer
  private readonly frameSkip: number
  private frameCount = 0

  constructor(renderer: Renderer, frameSkip: number) {
    this.renderer = renderer
    this.frameSkip = frameSkip
  }

  public snapshot = async (data: number[]): Promise<void> => {
    if (this.frameCount++ % this.frameSkip === 0) await this.renderer.render(data)
  }
}

export interface ColorLookup {
  (x: number, y: number, width: number, height: number): string
}

export class CanvasRenderer implements Renderer {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly lookupColor: ColorLookup

  constructor(canvas: HTMLCanvasElement, colors: ColorLookup = defaultColors) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.lookupColor = colors
  }

  public render = (data: number[]): Promise<void> => new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      this.renderNow(data)
      resolve()
    })
  });

  public renderNow = (data: number[]): void => {
    const side = Math.floor(Math.sqrt(data.length))
    const itemWidth = Math.floor(this.canvas.width / side)
    const itemHeight = Math.floor(this.canvas.height / side)

    this.ctx.fillStyle = "rgba(0,0,0,1)"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    for (let i = 0; i < data.length; i++) {
      const [valueX, valueY] = itemCoords(data[i], side)
      const [tileX, tileY] = itemCoords(i, side)

      this.ctx.fillStyle = this.lookupColor(valueX, valueY, side, side)

      this.ctx.fillRect(tileX * itemWidth, tileY * itemHeight, itemWidth, itemHeight)
    }
  }
}

const itemCoords = (value: number, side: number): [number, number] => [
  value % side,
  Math.floor(value / side)
]

export const defaultColors: ColorLookup = (x, y, width, height) => {
  const red = Math.floor(x / width * 255)
  const green = Math.floor(y / height * 255)

  return rgbToHex(red, green, 0)
}

export const rgbToHex = (r: number, g: number, b: number): string =>
  "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
