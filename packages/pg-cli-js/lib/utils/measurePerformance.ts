import { Logger } from 'lib/logger';

export function measurePerformance(fn: (...params: any[]) => any, name: string) {
  return (...args: any) => {
    performance.clearMeasures();
    performance.mark(`end-${name}`);

    const callback = args.pop();

    Logger.logInfo('-------------------------');
    Logger.logInfo(`Начало измерения ${name}`);

    fn(...args, (...params: any) => {
      callback(...params);

      performance.mark(`start-${name}`);
      performance.measure(name, `end-${name}`, `start-${name}`);

      Logger.logInfo('-------------------------');
      Logger.logInfo(`Завершение измерения ${name}`);
    });
  };
}
