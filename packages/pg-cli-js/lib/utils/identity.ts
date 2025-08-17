/**
 * Создает обертку вокруг переданной функции, которая вызывает ее с переданными параметрами.
 *
 * @template T - Тип функции, которую нужно обернуть.
 * @template P - Типы параметров функции.
 * @param {T} callback - Функция, которую необходимо обернуть.
 * @returns {function(...P): ReturnType<T>} - Обертка, вызывающая исходную функцию с переданными аргументами.
 */
export function identity<T extends Function>(callback: T) {
  return function identityWrapper<P>(firstArg: P) {
    return callback(firstArg);
  };
}
