'use strict';

const gulp = require('gulp');
const del = require('del');
const rename = require('gulp-rename');
const newer = require('gulp-newer');

const pug = require('gulp-pug');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uncss = require('gulp-uncss');

const debug = require('gulp-debug');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const validator = require('gulp-w3c-html-validator');
const sourcemaps = require('gulp-sourcemaps');
const remember = require('gulp-remember');
// const cached = require('gulp-cached');

const revCollector = require('gulp-rev-collector');
const rev = require('gulp-rev');

const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminPngquant = require('imagemin-pngquant');

const browserSync = require('browser-sync').create();
const JSDoc = require('gulp-jsdoc3');

const iconfont = require('gulp-iconfont');
const iconfontCSS = require('gulp-iconfont-css');
const fontName = 'awesomeBluRex';

const path = {
  root: 'app',
  // корневая папка
  src: 'src',
  // папка с иходниками
  dev: 'dev',
  // папка с быстрой сборкой для дальнейшей разработки
  prod: 'prod',
  // папка с финальной сборкой в продакшен
};

// === HELP ====================================================================
//
// gulp
// задача по умолчанию
// сборка проекта в режиме development
// запуск watch с локальным сервером
//
// gulp prod
// сборка проекта в продакшен
//
// gulp jsdoc
// создает документацию для js
//
// iconfont
// генерация иконочного шрифта

// =============================================================================
//
// === development tasks =======================================================
//
// =============================================================================

// === запуск локального сервера в режиме development
gulp.task('dev-run-server', function() {
  browserSync.init({
    server: {
      baseDir: `./${path.root}/${path.dev}`,
      // в какой папке искать index.html для запуска
      index: 'index.html',
      // как называется начальный файл для загрузки браузером
    },
    port: 3000,
    // порт на котором запустится browserSync
    ui: {
      port: 3001,
      // порт для user interface
    },
  });
});

// === копирование файлов в папку dev
gulp.task('dev-copy-files', function() {
  // для переноса всех стандартных файлов из папки src в dev
  return (
    gulp
      .src([
        `./${path.root}/${path.src}/**/*.+(html|css|js|map)`,
        `!./${path.root}/${path.src}/assets/vendors/source/**`,
        // web files
        `./${path.root}/${path.src}/**/*.+(jpeg|jpg|JPG|png|svg|gif|ico)`,
        // images
        `./${path.root}/${path.src}/**/*.+(eot|ttf|woff|woff2)`,
        // fonts
        `!./${path.root}/${path.src}/assets/icons/**`,
        // icons
      ])
      .pipe(newer(`./${path.root}/${path.dev}`))
      // только те, которые уже не лежат в приемнике
      .pipe(debug({ title: '= copy:' }))
      .pipe(gulp.dest(`./${path.root}/${path.dev}`))
      .pipe(browserSync.stream())
  );
});

// === компиляция pug в режиме development
gulp.task('dev-pug-compile', function() {
  return (
    gulp
      .src(
        [
          `./${path.root}/${path.src}/**/*.+(pug|jade)`,
          `!./${path.root}/${path.src}/**/_*.+(pug|jade)`,
        ],
        {
          since: gulp.lastRun('dev-pug-compile'),
        }
      )
      .pipe(
        // обработчик ошибок
        plumber({
          errorHandler: notify.onError(function(err) {
            return {
              title: 'dev Pug compile',
              message: err.message,
            };
          }),
        })
      )
      .pipe(debug({ title: '+ compile:' }))
      .pipe(remember('remember-dev-pug'))
      .pipe(pug({ pretty: true }))
      // минификация отключена
      .pipe(gulp.dest(`./${path.root}/${path.dev}`))
      .pipe(browserSync.stream())
  );
});

// === W3C валидатор HTML для папки dev
gulp.task('dev-html-validator', function() {
  return (
    gulp
      .src([`./${path.root}/${path.dev}/*.html`], {
        since: gulp.lastRun('dev-html-validator'),
      })
      .pipe(debug({ title: '+ validation:' }))
      .pipe(validator())
      // запуск валидатора на анализ
      .pipe(validator.reporter())
    // отчет
  );
});

// === компиляция SCSS в режиме development
// и создание sourcemaps к ним
gulp.task('dev-scss-compile', function() {
  return (
    gulp
      .src(
        [
          `./${path.root}/${path.src}/**/*.+(scss|sass)`,
          `!./${path.root}/${path.src}/**/vendors/**`,
        ],
        {
          since: gulp.lastRun('dev-scss-compile'),
        }
      )
      .pipe(
        // обработчик ошибок
        plumber({
          errorHandler: notify.onError(function(err) {
            return {
              title: 'dev SCSS compile',
              message: err.message,
            };
          }),
        })
      )
      .pipe(debug({ title: '+ compile:' }))
      .pipe(remember('remember-dev-scss'))
      .pipe(sourcemaps.init())
      // отсюда следим за изменениями для создания sourcemaps
      .pipe(sass())
      .pipe(sourcemaps.write('./'))
      // запись sourcemaps
      .pipe(gulp.dest(`./${path.root}/${path.dev}`))

      .pipe(browserSync.stream())
  );
});

// === компиляция bootstrap из SCSS для режима development
// и создание sourcemaps к нему
gulp.task('dev-bootstrap-scss-compile', function() {
  return (
    gulp
      .src(
        [
          `./${path.root}/${path.src}/assets/vendors/source/bootstrap/scss/*.scss`,
          `!./${path.root}/${path.src}/assets/vendors/source/bootstrap/scss/bootstrap-grid.scss`,
          `!./${path.root}/${path.src}/assets/vendors/source/bootstrap/scss/bootstrap-reboot.scss`,
        ],
        {
          since: gulp.lastRun('dev-bootstrap-scss-compile'),
        }
      )
      .pipe(
        // обработчик ошибок
        plumber({
          errorHandler: notify.onError(function(err) {
            return {
              title: 'dev Bootstrap SCSS compile',
              message: err.message,
            };
          }),
        })
      )
      .pipe(debug({ title: '+ compile:' }))
      .pipe(remember('remember-dev-bootstrap-scss'))
      .pipe(sourcemaps.init())
      // отсюда следим за изменениями для создания sourcemaps
      .pipe(sass())
      .pipe(sourcemaps.write('./'))
      .pipe(
        gulp.dest(`./${path.root}/${path.src}/assets/vendors/bootstrap/css`)
      )
  );
});

// === компиляция vendor libs из SCSS для режима development
// и создание sourcemaps к ним
gulp.task('dev-vendors-scss-compile', function() {
  return (
    gulp
      .src(
        [
          `./${path.root}/${path.src}/assets/vendors/source/**/*.scss`,
          `!./${path.root}/${path.src}/assets/vendors/source/bootstrap/**`,
        ],
        {
          since: gulp.lastRun('dev-vendors-scss-compile'),
        }
      )
      .pipe(
        // обработчик ошибок
        plumber({
          errorHandler: notify.onError(function(err) {
            return {
              title: 'dev vendors SCSS compile',
              message: err.message,
            };
          }),
        })
      )
      .pipe(debug({ title: '+ vendors compile:' }))
      .pipe(remember('remember-dev-vendors-scss'))
      .pipe(sourcemaps.init())
      // отсюда следим за изменениями для создания sourcemaps
      .pipe(sass())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(`./${path.root}/${path.src}/assets/vendors`))
  );
});

// =============================================================================
//
// === production tasks ========================================================
//
// =============================================================================

// === удалить содержимое папки prod и manifest
gulp.task('prod-delete', function() {
  return del([`./${path.root}/${path.prod}/**`, `./manifests/prod/**`], {
    read: false,
  });
});

// === запуск локального сервера в режиме production
gulp.task('prod-run-server', function() {
  browserSync.init({
    server: {
      baseDir: `./${path.root}/${path.prod}`,
      // в какой папке искать index.html для запуска
      index: 'index.html',
      // как называется начальный файл для загрузки браузером
    },
    port: 3030,
    // порт на котором запустится browserSync
    ui: {
      port: 3031,
      // порт для user interface
    },
  });
});

// === копирование файлов в папку prod
gulp.task('prod-copy-files', function() {
  // для переноса всех стандартных файлов из папки src в dev
  return gulp
    .src([
      `./${path.root}/${path.src}/**/*.+(html|css|js)`,
      `!./${path.root}/${path.src}/**/bootstrap/css/**`,
      // web files
      `./${path.root}/${path.src}/**/*.+(jpeg|jpg|JPG|png|svg|gif|ico)`,
      // images
      `./${path.root}/${path.src}/**/*.+(eot|ttf|woff|woff2)`,
      // fonts
      `!./${path.root}/${path.src}/assets/icons/**`,
      // icons
    ])
    .pipe(debug({ title: '= copy:' }))
    .pipe(gulp.dest(`./${path.root}/${path.prod}`));
});

// === компиляция pug в режиме production
gulp.task('prod-pug-compile', function() {
  return (
    gulp
      .src([
        `./${path.root}/${path.src}/**/*.+(pug|jade)`,
        `!./${path.root}/${path.src}/**/_*.+(pug|jade)`,
      ])
      .pipe(
        // обработчик ошибок
        plumber({
          errorHandler: notify.onError(function(err) {
            return {
              title: 'prod Pug compile',
              message: err.message,
            };
          }),
        })
      )
      .pipe(pug({ pretty: false }))
      // минификация включена
      .pipe(debug({ title: '= compile:' }))
      .pipe(gulp.dest(`./${path.root}/${path.prod}`))
  );
});

// === W3C валидатор HTML для папки prod
gulp.task('prod-html-validator', function() {
  return (
    gulp
      .src([`./${path.root}/${path.prod}/*.html`])
      .pipe(debug({ title: '+ validation:' }))
      .pipe(validator())
      // запуск валидатора на анализ
      .pipe(validator.reporter())
    // отчет
  );
});

// === компиляция SCSS в режиме production
// добавление хэшей в имя файла
// автопрефикс
// минификация
// создание манифеста
gulp.task('prod-scss-compile', function() {
  return (
    gulp
      .src([
        `./${path.root}/${path.src}/**/*.+(scss|sass)`,
        `!./${path.root}/${path.src}/**/vendors/**`,
      ])
      .pipe(
        // обработчик ошибок
        plumber({
          errorHandler: notify.onError(function(err) {
            return {
              title: 'prod SCSS compile',
              message: err.message,
            };
          }),
        })
      )
      .pipe(debug({ title: '+ compile:' }))
      .pipe(sass())
      .pipe(rev())
      // добавить хэш в имени файла
      .pipe(debug({ title: '+ autoprefix:' }))
      .pipe(autoprefixer())
      // автопрефиксы (настройки в package.json в browserslist)
      .pipe(debug({ title: '+ minify:' }))
      .pipe(
        cleanCSS(
          {
            compatibility: 'ie8',
            // режим совместимость с ie8
            debug: true,
            // выводит логи в консоль
            level: {
              // уровень оптимизации
              1: {
                // список первого уровня оптимизации
                all: true,
                // использовать все опции из списка 1 уровня
                normalizeUrls: false,
                // кроме изменения URL
              },
              2: {
                // список второго уровня минификации
                all: true,
                removeUnusedAtRules: false,
                // не удалять неиспользуемые свойства (иначе удаляет font.css)
                //   restructureRules: true
                // // произвести реструктуризацию
              },
            },
          },
          (details) => {
            // вывод логов
            console.log(
              `original ${details.name}: ${details.stats.originalSize}`
            );
            console.log(
              `minify   ${details.name}: ${details.stats.minifiedSize}`
            );
          }
        )
      )
      .pipe(gulp.dest(`./${path.root}/${path.prod}`))
      .pipe(rev.manifest())
      // инициализация модуля rev для создания манифеста
      .pipe(gulp.dest(`./manifests/${path.prod}`))
    // куда сохранить манифест
  );
});

// === изменение в html
// строки с подключением стилей для перезаписи хэша в названии
gulp.task('prod-add-hash-in-html', function() {
  return gulp
    .src(['./manifests/prod/*.json', `./${path.root}/${path.prod}/**/*.html`])
    .pipe(
      revCollector({
        replaceReved: true,
      })
    )
    .pipe(debug({ title: 'fuck!:' }))
    .pipe(gulp.dest(`./${path.root}/${path.prod}`));
});

// === компиляция bootstrap из SCSS для режима production
// вырезание из него всех стилей, которые не используются в проекте
gulp.task('prod-bootstrap-scss-compile-uncss', function() {
  return gulp
    .src([
      `./${path.root}/${path.src}/assets/vendors/source/bootstrap/scss/*.scss`,
      `!./${path.root}/${path.src}/assets/vendors/source/bootstrap/scss/bootstrap-grid.scss`,
      `!./${path.root}/${path.src}/assets/vendors/source/bootstrap/scss/bootstrap-reboot.scss`,
    ])
    .pipe(
      // обработчик ошибок
      plumber({
        errorHandler: notify.onError(function(err) {
          return {
            title: 'prod Bootstrap SCSS compile',
            message: err.message,
          };
        }),
      })
    )
    .pipe(debug({ title: '+ bootstrap compile:' }))
    .pipe(sass())
    .pipe(
      uncss({
        html: [`./${path.root}/${path.prod}/**/*.html`],
      })
    )

    .pipe(
      gulp.dest(`./${path.root}/${path.prod}/assets/vendors/bootstrap/css`)
    );
});

// === прожарка bootstrap для production
// простановка вендорных префиксов
// минификация
// добавление суффикса .min
// добавление хэша
// создание манифеста
gulp.task('prod-bootstrap-autoprefix-minify', function() {
  return (
    gulp
      .src([`./${path.root}/${path.prod}/**/bootstrap/css/bootstrap.css`])
      .pipe(
        // обработчик ошибок
        plumber({
          errorHandler: notify.onError(function(err) {
            return {
              title: 'prod Bootstrap CSS min',
              message: err.message,
            };
          }),
        })
      )
      .pipe(debug({ title: '+ bootstrap autoprefix:' }))
      .pipe(autoprefixer())
      // автопрефиксы (настройки в package.json в browserslist)

      .pipe(debug({ title: '+ bootstrap minify:' }))
      .pipe(
        cleanCSS(
          {
            compatibility: 'ie8',
            // режим совместимость с ie8
            debug: true,
            // выводит логи в консоль
            level: {
              // уровень оптимизации
              1: {
                // список первого уровня оптимизации
                // === включить все опции из списка 1 уровня
                all: true,
                // === перемещает @charset в начало файла
                // cleanupCharsets: true,
                // === приведение URL к общему виду
                normalizeUrls: false,
                // optimizeBackground: true,
                // optimizeBorderRadius: true,
                // optimizeFilter: true,
                // optimizeFont: true,
                // optimizeFontWeight : true,
                // optimizeOutline: true,
                // === удаление пустых правил и вложенных блоков
                // removeEmpty: true,
                // === удаление отрицательных paddings
                // removeNegativePaddings: true,
                // === удаляет кавычки, когда они не нужны
                // removeQuotes: true,
                // === удаление ненужных пробелов
                // removeWhitespace : true,
                // === удаляет избыточные нули
                // replaceMultipleZeros: true
                // === укорачивает единицы времени
                // replaceTimeUnits: true,
                // === заменяет нулевые единицы измерения
                // replaceZeroUnits: true,
                // === округляет пиксели до десятичных знаков
                // roundingPrecision : false,
                // === метод сортировки селекторов
                // 'natural'
                // 'standard'
                // 'none'
                // false
                // selectorsSortingMethod : 'standard',
                // === число сохраняемых специальных комментариев, типа / *! ... * /
                // specialComments: ' all '
                // === оптимизация правил с собакой @
                // tidyAtRules: true,
                // === оптимизация областей действия @media
                // tidyBlockScopes: true,
                // === оптимизация селекторов
                // tidySelectors: true,
                // === функция для callback, нужна для отладки
                // transform: function () {}
              },
              2: {
                // список второго уровня минификации
                // === включить все опции из списка 2 уровня
                all: true,
                // === слияние соседних правил
                // mergeAdjacentRules: true,
                // === слияние в короткие строки ???
                // mergeIntoShorthands : true,
                // === слияние @media
                // mergeMedia: true,
                // === слияние не соседних правил
                mergeNonAdjacentRules: false,
                // === семантическое слияние
                // mergeSemantically : false ,
                // === переопределяет свойства на основе понятности
                // overrideProperties: true,
                // === удаление пустых правил и вложенных блоков
                // removeEmpty: true,
                // === уменьшает сокращение несоседних правил
                // reduNonAdjacentRules: true,
                // === удаление дубликатов @font-face
                // removeDuplicateFontRules: true,
                // === удаление дубликатов @media
                // removeDuplicateMediaBlocks: true,
                // === удаление дубликатов правил
                // removeDuplicateRules: true,
                // === удаление неиспользуемых свойств
                removeUnusedAtRules: false,
                // === произвести реструктуризацию слияние одного и того же селектора из разных мест
                // restructureRules: false
                // определение свойств, которые не будут оптимизироваться
                // skipProperties: []
              },
            },
          },
          (details) => {
            // вывод логов
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
          }
        )
      )
      .pipe(rev())
      // добавить хэш в имени файла;
      .pipe(gulp.dest(`./${path.root}/${path.prod}`))
      .pipe(rev.manifest())
      // инициализация модуля rev для создания манифеста
      .pipe(rename({ suffix: '-bootstrap' }))
      // переименование манифеста
      .pipe(gulp.dest(`./manifests/${path.prod}`))
    // куда сохранить манифест
  );
});

// === компиляция vendor libs из SCSS для режима development
// вырезание из них всех стилей, которые не используются в проекте
gulp.task('prod-vendors-scss-compile-uncss', function() {
  return gulp
    .src([
      `./${path.root}/${path.src}/assets/vendors/source/**/*.scss`,
      `!./${path.root}/${path.src}/assets/vendors/source/bootstrap/**`,
    ])
    .pipe(
      // обработчик ошибок
      plumber({
        errorHandler: notify.onError(function(err) {
          return {
            title: 'prod vendors SCSS compile',
            message: err.message,
          };
        }),
      })
    )
    .pipe(debug({ title: '+ vendors compile:' }))
    .pipe(sass())
    .pipe(
      uncss({
        html: [`./${path.root}/${path.prod}/**/*.html`],
      })
    )

    .pipe(gulp.dest(`./${path.root}/${path.prod}/assets/vendors`));
});

// === прожарка vendor libs CSS для production
// простановка вендорных префиксов
// минификация
// добавление суффикса .min
// добавление хэша
// создание манифеста
gulp.task('prod-vendors-autoprefix-minify', function() {
  return (
    gulp
      .src([
        `./${path.root}/${path.prod}/**/vendors/**/css/*.css`,
        `!./${path.root}/${path.prod}/**/vendors/bootstrap/css/*.css`,
      ])
      .pipe(
        // обработчик ошибок
        plumber({
          errorHandler: notify.onError(function(err) {
            return {
              title: 'prod vendors CSS min',
              message: err.message,
            };
          }),
        })
      )
      .pipe(debug({ title: '+ bootstrap autoprefix:' }))
      .pipe(autoprefixer())
      // автопрефиксы (настройки в package.json в browserslist)

      .pipe(debug({ title: '+ bootstrap minify:' }))
      .pipe(
        cleanCSS(
          {
            compatibility: 'ie8',
            // режим совместимость с ie8
            debug: true,
            // выводит логи в консоль
            level: {
              // уровень оптимизации
              1: {
                // список первого уровня оптимизации
                // === включить все опции из списка 1 уровня
                all: true,
                // === перемещает @charset в начало файла
                // cleanupCharsets: true,
                // === приведение URL к общему виду
                normalizeUrls: false,
                // optimizeBackground: true,
                // optimizeBorderRadius: true,
                // optimizeFilter: true,
                // optimizeFont: true,
                // optimizeFontWeight : true,
                // optimizeOutline: true,
                // === удаление пустых правил и вложенных блоков
                // removeEmpty: true,
                // === удаление отрицательных paddings
                // removeNegativePaddings: true,
                // === удаляет кавычки, когда они не нужны
                // removeQuotes: true,
                // === удаление ненужных пробелов
                // removeWhitespace : true,
                // === удаляет избыточные нули
                // replaceMultipleZeros: true
                // === укорачивает единицы времени
                // replaceTimeUnits: true,
                // === заменяет нулевые единицы измерения
                // replaceZeroUnits: true,
                // === округляет пиксели до десятичных знаков
                // roundingPrecision : false,
                // === метод сортировки селекторов
                // 'natural'
                // 'standard'
                // 'none'
                // false
                // selectorsSortingMethod : 'standard',
                // === число сохраняемых специальных комментариев, типа / *! ... * /
                // specialComments: ' all '
                // === оптимизация правил с собакой @
                // tidyAtRules: true,
                // === оптимизация областей действия @media
                // tidyBlockScopes: true,
                // === оптимизация селекторов
                // tidySelectors: true,
                // === функция для callback, нужна для отладки
                // transform: function () {}
              },
              2: {
                // список второго уровня минификации
                // === включить все опции из списка 2 уровня
                all: true,
                // === слияние соседних правил
                // mergeAdjacentRules: true,
                // === слияние в короткие строки ???
                // mergeIntoShorthands : true,
                // === слияние @media
                // mergeMedia: true,
                // === слияние не соседних правил
                mergeNonAdjacentRules: false,
                // === семантическое слияние
                // mergeSemantically : false ,
                // === переопределяет свойства на основе понятности
                // overrideProperties: true,
                // === удаление пустых правил и вложенных блоков
                // removeEmpty: true,
                // === уменьшает сокращение несоседних правил
                // reduNonAdjacentRules: true,
                // === удаление дубликатов @font-face
                // removeDuplicateFontRules: true,
                // === удаление дубликатов @media
                // removeDuplicateMediaBlocks: true,
                // === удаление дубликатов правил
                // removeDuplicateRules: true,
                // === удаление неиспользуемых свойств
                removeUnusedAtRules: false,
                // === произвести реструктуризацию слияние одного и того же селектора из разных мест
                // restructureRules: false
                // определение свойств, которые не будут оптимизироваться
                // skipProperties: []
              },
            },
          },
          (details) => {
            // вывод логов
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
          }
        )
      )
      .pipe(rev())
      // добавить хэш в имени файла;
      .pipe(gulp.dest(`./${path.root}/${path.prod}`))
      .pipe(rev.manifest())
      // инициализация модуля rev для создания манифеста
      .pipe(rename({ suffix: '-vendors' }))
      // переименование манифеста
      .pipe(gulp.dest(`./manifests/${path.prod}`))
    // куда сохранить манифест
  );
});

// === удаление файла vendors libs css без вендорных префиксов в режиме production
gulp.task('prod-del-vendors-without-prefix', function() {
  return del(
    [
      `./${path.root}/${path.prod}/assets/vendors/**/*.css`,
      `!./${path.root}/${path.prod}/assets/vendors/**/*-??????????.css`,
    ],
    { read: false }
  );
});

// === оптимизация изображений для режима production
gulp.task('prod-img-min', function() {
  return (
    gulp
      .src(`./${path.root}/${path.src}/**/*.+(jpeg|jpg|png|svg)`)

      .pipe(debug({ title: '+ compress img:', showFiles: true }))

      // .pipe(gulp.dest(`./${path.root}/${path.prod}`))
      // копирование картинок в папку public до сжатия,
      // т.к. imagemin может пропустить парочку
      .pipe(
        imagemin([
          imagemin.gifsicle({ interlaced: true }),
          imageminJpegRecompress({
            // передача сжатия jpg плагину imagemin-jpeg-recompress
            progressive: true,
            max: 80,
            min: 70,
          }),
          imageminPngquant({
            // передача сжатия png плагину imagemin-pngquant
            quality: [0.7, 0.8],
          }),

          imagemin.svgo({ plugins: [{ removeViewBox: true }] }),
          // сжатие svg
        ])
      )
      .pipe(gulp.dest(`./${path.root}/${path.prod}`))
  );
});

// =============================================================================
//
// === extra tasks =============================================================
//
// =============================================================================

// === JSDoc
gulp.task('jsdoc', function(cb) {
  gulp
    .src(['./README.md', `./${path.root}/${path.src}/**/*.js`], { read: false })
    .pipe(JSDoc(cb));
});

// === icons font
gulp.task('iconfont', function() {
  return gulp
    .src([`./${path.root}/${path.src}/assets/icons/*.svg`])
    .pipe(debug({ title: '+ 1 part iconfont compile:', showFiles: true }))
    .pipe(
      // обработчик ошибок
      plumber({
        errorHandler: notify.onError(function(err) {
          return {
            title: 'iconfont error',
            message: err.message,
          };
        }),
      })
    )
    .pipe(debug({ title: '+ 2 part iconfont compile:', showFiles: true }))
    .pipe(
      iconfontCSS({
        // генерация шаблонов scss и font-face
        path: `./${path.root}/${path.src}/assets/icons/_icons_template.scss`,
        // источник svg иконок
        fontName: fontName,
        // название шрифта
        targetPath: `../css/utils/_iconfont.scss`,
        // @font-face для нового шрифта
        fontPath: `../../assets/fonts/`,
        // путь к шрифту для @font-face
      })
    )
    .pipe(
      iconfont({
        fontName: fontName,
        formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
      })
    )
    .pipe(gulp.dest(`./${path.root}/${path.src}/assets/fonts/`));
  // приемник для нового шрифта
});

// =============================================================================
//
// === watches and build tasks =================================================
//
// =============================================================================

// === watch для режима development
gulp.task('dev-watch', function() {
  // === при изменении pug
  // компиляция и валидация
  gulp.watch(
    [`./${path.root}/${path.src}/**/*.+(pug|jade)`],
    gulp.series(['dev-pug-compile', 'dev-html-validator'])
  );
  // === при изменении scss проекта
  // компиляция
  gulp.watch(
    [
      `./${path.root}/${path.src}/**/*.+(scss|sass)`,
      `!./${path.root}/${path.src}/**/vendors/**`,
    ],
    gulp.parallel(['dev-scss-compile'])
  );
  // === при изменении исходников bootstrap SCSS
  // компиляция
  gulp.watch(
    [`./${path.root}/${path.src}/assets/vendors/source/bootstrap/scss/*.scss`],
    gulp.parallel(['dev-bootstrap-scss-compile'])
  );
  // === при изменении исходников vendor libs SCSS
  // компиляция
  gulp.watch(
    [
      `./${path.root}/${path.src}/assets/vendors/source/**/*.scss`,
      `!./${path.root}/${path.src}/assets/vendors/source/bootstrap/**`,
    ],
    gulp.parallel(['dev-vendors-scss-compile'])
  );

  // === при изменении файлов не требующих компиляции
  // копирует их
  gulp.watch(
    [
      `./${path.root}/${path.src}/**/*.+(html|css|js)`,
      `./${path.root}/${path.src}/**/*.+(jpeg|jpg|JPG|png|svg|gif|ico)`,
      `./${path.root}/${path.src}/**/*.+(eot|ttf|woff|woff2)`,
      `!./${path.root}/${path.src}/assets/icons/**`,
    ],
    gulp.series(['dev-copy-files'])
  );
});

// === default task
gulp.task(
  'default',
  gulp.series(
    'dev-pug-compile',
    gulp.parallel(
      'dev-scss-compile',
      'dev-copy-files',
      'dev-run-server',
      'dev-watch'
    )
  )
);

// === сборка в продакшен
gulp.task(
  'prod',
  gulp.series([
    'prod-delete',
    'prod-pug-compile',
    'prod-scss-compile',
    'prod-bootstrap-scss-compile-uncss',
    'prod-bootstrap-autoprefix-minify',
    'prod-vendors-scss-compile-uncss',
    'prod-vendors-autoprefix-minify',
    'prod-del-vendors-without-prefix',
    'prod-add-hash-in-html',
    'prod-html-validator',
    'prod-copy-files',
    'prod-img-min',
    'prod-run-server',
  ])
);

//
//
//
//
//
//
//
//
// === справочная информация и примеры =========================================
{
  // // === вспомогательная функция
  // // каждая функция должна сигнализировать гальпу о завершении
  // gulp.task('example-hello', function(callback) {
  // 	console.log('Hello Gulp!');
  // 	callback();
  // 	// завершение задачи
  // });
  //
  // // === сортировка файлов на выходе
  // // копирование файлов в разные приемники, в зависимости от выполнения условий
  // gulp.task('example-copy-files', function(callback) {
  // 	return gulp.src('./src/**').pipe(
  // 		gulp.dest(function(file) {
  // 			return file.extname == '.js'
  // 				? './js'
  // 				: file.extname == '.jpg'
  // 				? './img'
  // 				: './trash';
  // 			// если .js, то в ./js,
  // 			// если .jpg, то в ./img,
  // 			// иначе (все остальное) в ./trash
  // 		})
  // 	);
  // });
  //
  // // === возможности внутри задачи
  // gulp.task('example-listening-files', function() {
  // 	return gulp
  // 		.src('./src/**')
  // 		.on('data', function(file) {
  // 			// перечисление всех обрабатываемых файлов в консоли
  // 			console.log(file);
  // 		})
  // 		.pipe(gulp.dest('./dest'));
  // });
  //
  // // === удаление файлов без их чтения в память
  // gulp.task('example-remove-files-without-read', function() {
  // 	return .del(['./src/**'], { read: false })
  // содержимое файлов не читается
  // });
  //
  // // === вычисление имени файла и его пути
  // //
  // // когда поток Gulp обрабатывает какой-то файл, он создает объект file{}
  // // и вычисляет его свойства:
  // // file.contents 	- содержимое файла
  // // file.path 		- полный путь к файлу вместе с именем файла
  // // file.cwd 		- текущая директория, в которой крутится консоль
  // // file.base		- базовая часть пути, которая идет до маски **
  // // file.relative	- часть пути вычисляемая из маски ** вместе с именем файла
  // // file.dirname		- путь до файла, без имени файла
  // // file.basename	- имя файла с расширением
  // // file.stem		- имя файла без расширения
  // // file.extname		- расширение файла
  // gulp.task('example-view-file.base', function() {
  // 	return gulp
  // 		.src(['./src/**/*.*'])
  // 		.on('data', function(file) {
  // 			// вывод в консоль всех свойств объекта file{}
  // 			console.log({
  // 				file_contents: file.contents,
  // 				file_path: file.path,
  // 				file_cwd: file.cwd,
  // 				file_base: file.base,
  // 				file_relative: file.relative,
  // 				file_dirname: file.dirname,
  // 				file_basename: file.basename,
  // 				file_stem: file.stem,
  // 				file_extname: file.extname
  // 			});
  // 		})
  // 		.pipe(gulp.dest('./dest'));
  // });
  //
  // // === вывод в консоль действий между потоками
  // gulp.task('example-debug', function() {
  // 	return (
  // 		gulp
  // 			.src(['./src/**/*.*'])
  // 			.pipe(debug({ title: 'copy-file' }))
  // 			// debag() перечислит все файлы, которые были пропущены через него,
  // 			// в данном случае от источника к приемнику
  // 			// debug() можно вызывать после каждого потока с разными заголовками
  // 			.pipe(gulp.dest('./dest'))
  // 	);
  // });
  //
  // // === параллельное и последовательное выполнение задач
  // // задачи которые не возвращают завершение нельзя ставить в .series()
  // gulp.task(
  // 	'example-parallel-and-series',
  // 	gulp.series(
  // 		// сначала выполняются задачи последовательно
  // 		'task1',
  // 		'task2',
  // 		gulp.parallel(
  // 			// затем оставшиеся параллельно
  // 			'task3',
  // 			'task4'
  // 		)
  // 	)
  // );
  //
  // // === применение потока только для измененных файлов.
  // // из потока выпадают файлы, дата создания которых
  // //  меньше даты последнего запуска задачи,
  // // также не копируются те файлы, которые уже есть в приемнике
  // gulp.task('example-only-changed', function() {
  // 	return (
  // 		gulp
  // 			.src(['./src/**/*.*'], { since: gulp.lastRun('task-name') })
  // 			// поток возьмет только те файлы,
  // 			// которые изменились с последнего запуска задачи.
  // 			// при первом запуске, будут копироваться все файлы
  // 			.pipe(newer('./dest'))
  // 			// проверяет имеется ли такой файл в приемнике,
  // 			// если нет, то копирует.
  // 			// сравниваются имя файла и дата изменения.
  // 			// работает при первом запуске
  //			// правильно работает только если задачу запускает watch
  // 			.pipe(cached('styles'))
  // 			// запоминает все файлы, которые через него прошли
  // 			// при повторном запуске не пропустит через себя файл
  // 			// с тем же содержимым
  // 			.pipe(gulp.dest('./dest'))
  // 	);
  // });
  // // since не читает файл
  // // newer не читает файл
  // // cached читает файл, что чаще всего не нужно
  // gulp.task('example-watch', function() {
  // 	gulp
  // 		.watch('./src/*.css', gulp.series('example-only-changed'))
  // 		.on('unlink', function(filepath) {
  // 			// при удалении какого-либо файла кэш плагина cached будет переписан
  // 			delete cached.caches.styles[path.resolve(filepath)];
  // 		});
  // });
  //
  // // === обработка ошибок в потоке
  // gulp.task('example-pug-compile', function() {
  // 	return (
  // 		gulp
  // 			.src(['app/src/**/*.+(pug|jade)'])
  // 			.pipe(pug({ pretty: false }))
  // 			// === вариант с выводом в консоль
  // 			.on('error', function(err) {
  // 				// если в предыдущем потоке была ошибка,
  // 				// то для нее будет запущена функция
  // 				console.log(err.message);
  // 				// можно добавить целиком объект err,
  // 				// а не одно его свойство .message
  // 				this.end();
  // 				// чтобы данный обработчик ошибки не прервала задачу
  // 			})
  // 			// === вариант с алертом плагина gulp-notify
  // 			.on(
  // 				'error',
  // 				notify.onError(function(err) {
  // 					// кастомизация алерта
  // 					return {
  // 						title: 'pug compile',
  // 						message: err.message
  // 					};
  // 				})
  // 			)
  // 			.pipe(gulp.dest('app/public'))
  // 	);
  // });
  //
  // // === применение одного обработчика ошибок ко всем потокам
  // gulp.task('example-scss-compile-and-autoprefix', function() {
  // 	return gulp
  // 		.src(['./app/src/**/*.scss'])
  // 		.pipe(
  // 			// патчит все последующие pipe таким образом, чтобы
  // 			// к ним вызывался обработчик ошибок
  // 			plumber({
  // 				errorHandler: notify.onError(function(err) {
  // 					return {
  // 						title: 'pug compile',
  // 						message: err.message
  // 					};
  // 				})
  // 			})
  // 		)
  // 		.pipe(sass())
  // 		.pipe(autoprefixer())
  // 		.pipe(gulp.dest('app/public'));
  // });
  //
  // // === запуск локального сервера
  // // чтобы любая задача перезапускала браузер, необходимо добавить поток
  // // .pipe(browserSync.stream());
  // // либо создать специальный watch
  // // gulp.watch(['./src/**']).on('change', browserSync.reload)
  // gulp.task('example-run-server', function() {
  // 	browserSync.init({
  // 		server: {
  // 			baseDir: './dev',
  // 			// в какой папке искать index.html для запуска
  // 			index: 'index.html'
  // 			// как называется начальный файл для загрузки браузером
  // 		},
  // 		port: 3000,
  // 		// порт на котором запустится browserSync
  // 		ui: {
  // 			port: 3001
  // 			// порт для user interface
  // 		}
  // 	});
  // });
  //
  // // === создание sourcemaps
  // // все плагины между инициализацией и записью sourcemaps
  // // должны иметь поддержку gulp-sourcemaps
  // // список таких плагинов
  // // https://github.com/gulp-sourcemaps/gulp-sourcemaps/wiki/Plugins-with-gulp-sourcemaps-support
  // gulp.task('example-create-sourcemaps', function() {
  // 	return (
  // 		gulp
  // 			.src(['./app/src/**/*.scss'])
  // 			.pipe(sourcemaps.init())
  // 			// начинает следить за изменениями
  // 			.pipe(sass())
  // 			.pipe(autoprefixer())
  // 			.pipe(sourcemaps.write('./'))
  // 			// записывает sourcemaps
  // 			.pipe(gulp.dest('./app/dev'))
  // 	);
  // });
  // 
  // === полное описание минификации
//   .pipe(
//     cleanCSS(
//       {
//         compatibility: 'ie8',
//         // режим совместимость с ie8
//         debug: true,
//         // выводит логи в консоль
//         level: {
//           // уровень оптимизации
//           1: {
//             // список первого уровня оптимизации
//             // === включить все опции из списка 1 уровня
//             all: true,
//             // === перемещает @charset в начало файла
//             // cleanupCharsets: true,
//             // === приведение URL к общему виду
//             normalizeUrls: false,
//             // optimizeBackground: true,
//             // optimizeBorderRadius: true,
//             // optimizeFilter: true,
//             // optimizeFont: true,
//             // optimizeFontWeight : true,
//             // optimizeOutline: true,
//             // === удаление пустых правил и вложенных блоков
//             // removeEmpty: true,
//             // === удаление отрицательных paddings
//             // removeNegativePaddings: true,
//             // === удаляет кавычки, когда они не нужны
//             // removeQuotes: true,
//             // === удаление ненужных пробелов
//             // removeWhitespace : true,
//             // === удаляет избыточные нули
//             // replaceMultipleZeros: true
//             // === укорачивает единицы времени
//             // replaceTimeUnits: true,
//             // === заменяет нулевые единицы измерения
//             // replaceZeroUnits: true,
//             // === округляет пиксели до десятичных знаков
//             // roundingPrecision : false,
//             // === метод сортировки селекторов
//             // 'natural'
//             // 'standard'
//             // 'none'
//             // false
//             // selectorsSortingMethod : 'standard',
//             // === число сохраняемых специальных комментариев, типа / *! ... * /
//             // specialComments: ' all '
//             // === оптимизация правил с собакой @
//             // tidyAtRules: true,
//             // === оптимизация областей действия @media
//             // tidyBlockScopes: true,
//             // === оптимизация селекторов
//             // tidySelectors: true,
//             // === функция для callback, нужна для отладки
//             // transform: function () {}
//           },
//           2: {
//             // список второго уровня минификации
//             // === включить все опции из списка 2 уровня
//             all: true,
//             // === слияние соседних правил
//             // mergeAdjacentRules: true,
//             // === слияние в короткие строки ???
//             // mergeIntoShorthands : true,
//             // === слияние @media
//             // mergeMedia: true,
//             // === слияние не соседних правил
//             mergeNonAdjacentRules: false,
//             // === семантическое слияние
//             // mergeSemantically : false ,
//             // === переопределяет свойства на основе понятности
//             // overrideProperties: true,
//             // === удаление пустых правил и вложенных блоков
//             // removeEmpty: true,
//             // === уменьшает сокращение несоседних правил
//             // reduNonAdjacentRules: true,
//             // === удаление дубликатов @font-face
//             // removeDuplicateFontRules: true,
//             // === удаление дубликатов @media
//             // removeDuplicateMediaBlocks: true,
//             // === удаление дубликатов правил
//             // removeDuplicateRules: true,
//             // === удаление неиспользуемых свойств
//             removeUnusedAtRules: false,
//             // === произвести реструктуризацию слияние одного и того же селектора из разных мест
//             // restructureRules: false
//             // определение свойств, которые не будут оптимизироваться
//             // skipProperties: []
//           },
//         },
//       },
//       (details) => {
//         // вывод логов
//         console.log(`${details.name}: ${details.stats.originalSize}`);
//         console.log(`${details.name}: ${details.stats.minifiedSize}`);
//       }
//     )
//   )
}
