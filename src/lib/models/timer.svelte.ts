export class TimerModel {
  timers = $state<Record<string, { startTime: number; duration: number }>>({});

  start(id: string, duration: number) {
    this.timers[id] = { startTime: Date.now(), duration };
  }

  remove(id: string) {
    delete this.timers[id];
  }

  get(id: string) {
    return this.timers[id];
  }
}
