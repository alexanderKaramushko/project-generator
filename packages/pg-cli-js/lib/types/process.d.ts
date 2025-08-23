declare namespace NodeJS {
  interface Process {
    emit(event: 'log', level: 'info' | 'error' | 'warning', message: string): this;
  }
}
