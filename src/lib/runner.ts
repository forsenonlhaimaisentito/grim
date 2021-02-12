export type SnapshotFunction = () => Promise<void>

export type AlgorithmFunction = (data: number[], snapshot: SnapshotFunction) => Promise<void>

// Eval is required here because Babel won't let us access AsyncFunction
const AsyncFunction = eval(`Object.getPrototypeOf(async function () {
  return null
}).constructor`)

export const parseAlgorithmCode = (code: string): AlgorithmFunction => {
  return new AsyncFunction("data", "snapshot", code)
}

export interface Runner {
  /**
   * Runs the supplied algorithm function until it is done or cancelled.
   * Errors thrown by the function are re-thrown.
   *
   * @param algo The algorithm function.
   * @param data The algorithm input data.
   * @return `true` if the function ran to completion, `false` if it was cancelled
   */
  run(algo: AlgorithmFunction, data: number[]): Promise<boolean>

  /**
   * Cancels the currently running algorithm function, this method is idempotent if the execution
   * was already cancelled.
   */
  cancel(): void
}

export interface Snapshooter {
  snapshot(data: number[]): Promise<void>
}

class CancelledError extends Error {
}

export class DefaultRunner implements Runner {
  private readonly snapshooter: Snapshooter
  private cancelled = false
  private running = false

  constructor(snapshooter: Snapshooter) {
    this.snapshooter = snapshooter
  }

  public run = async (algo: AlgorithmFunction, data: number[]): Promise<boolean> => {
    const snapshot: SnapshotFunction = () => {
      this.checkpoint()
      return this.snapshooter.snapshot(data)
    }

    try {
      this.running = true
      await algo(data, snapshot)
      return true
    } catch (e) {
      if (e instanceof CancelledError) return false
      throw e
    } finally {
      this.running = false
      this.cancelled = false
    }
  }

  public cancel = (): void => {
    if (this.running) this.cancelled = true
  }

  private checkpoint = () => {
    if (this.cancelled) throw new CancelledError()
  }
}
