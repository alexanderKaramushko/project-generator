# pg-template-starter

Стартовый шаблон для новых проектов.

## Глоссарий

Внешние файлы, зависимости, конфиги – элементы root <br/>
Внутренние файлы, зависимости, конфиги – элементы проекта в src

## Структура пресета в шаблоне

- package – package.json, который включает в себя внешние инфраструктурные и внутренние проектные зависимости
- configs – внешние инфраструктурные конфиги
- fileStructure – библиотека чистых файловых структур проекта без инфраструктурных файлов (внешняя и внутренняя)
- builder – библиотека сборщика (к примеру, esbuild, parcel, rollup)

## Что должна или может включать в себя файловая структура проекта (fileStructure)

### src:

- точка входа<span style="color: red;">*</span>
- файлы окружения
- файл документации (к примеру, README.md)<span style="color: red;">*</span>
- сборщик проекта (к примеру, vite, esbuild, parcel)<span style="color: red;">*</span>
- скрипты сборки и старта проекта<span style="color: red;">*</span>
- структура на основе методологий (к примеру, FSD, atomic, DDD)
