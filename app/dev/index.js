'use strict';

jQuery.noConflict();
(($) => {
  $.fn.mouseMoveParallax = function() {
    return this.each(function() {
      // === настройки по умолчанию
      const defaults = {
        perspectiveLength: 400,
        parallaxPower: 0.06,
      };

      // === глобальные переменные
      const $this = $(this);
      // глобальный this для данного плагина
      let windowParameters = {};
      // объект с размерами окна и точкой центра
      let deviationFromCenter = {};
      //  объект с координатами отклонения курсора от центра окна
      let layerPosition = {};
      // объект хранящий координаты position top/left для перемещаемого объекта

      console.log($this);

      // === начальное состояние окна браузера
      // прослушивание события движения мыши
      function parallaxReady() {
        // === узнать размеры окна браузера и точку центра
        windowParameters = {
          width: $(window).width(),
          height: $(window).height(),
          centerX: $(window).width() / 2,
          centerY: $(window).height() / 2,
        };

        layerPosition = {
          top: $this.css('top'),
          left: $this.css('left'),
          depth: $this.data('perspective-depth'),
        };
      }

      function getPositionMouse(event) {
        // === узнать координаты мыши
        const mousePosition = {
          X: event.clientX,
          Y: event.clientY,
        };

        deviationFromCenter = {
          X: mousePosition.X - windowParameters.centerX,
          Y: mousePosition.Y - windowParameters.centerY,
        };
      }

      // === нарисовать композицию в зависимости от координат курсора
      function parallaxDraw() {
        // === перевод градусов в радианы
        function toRad(deg) {
          return (Math.PI * deg) / 180;
        }

        // === расчет перспективы (DE) для каждого из слоя
        // в зависимости от положения мыши (BC) относительно центра композиции
        //
        //   A
        //   |\
        //   | \
        //   |  \
        //  D|___\E ← move parallax layer
        //   |    \
        //   |_____\ ← mouse deviation from centre
        //   B      C
        function getPerspective(BC) {
          // === большой треугольник
          const AB = defaults.perspectiveLength;
          // const AC = Math.sqrt(BC ** 2 + AB ** 2);
          const degA = Math.round((180 / Math.PI) * Math.atan2(BC, AB));
          const degC = 180 - 90 - degA;

          // === малый треугольник
          const AD = layerPosition.depth;

          const degE = degC;
          const radE = toRad(degE);
          // const sinE = Math.sin(radE);
          const tanE = Math.tan(radE);

          // const AE = AD / sinE;
          const DE = AD / tanE;

          return DE;
        }

        // === расчет отклонения для слоя относительно центра композиции
        const dX = getPerspective(deviationFromCenter.X);
        const dY = getPerspective(deviationFromCenter.Y);

        // === смещение каждого слоя
        $this.css({
          left: parseInt(layerPosition.left) + dX * defaults.parallaxPower,
          top: parseInt(layerPosition.top) + dY * defaults.parallaxPower,
        });
      }

      // === инициализация функций
      $(window)
        // === после загрузки окна браузера
        .on('load', function() {
          parallaxReady();
        })
        .on('mousemove', function(event) {
          getPositionMouse(event);
          parallaxDraw();
        });
    });
  };
})(jQuery);

jQuery('.parallax-layer').mouseMoveParallax();
