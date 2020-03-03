'use strict';

jQuery.noConflict();
(($) => {
  $.fn.mouseMoveParallax = function() {
    return this.each(function() {
      // === настройки по умолчанию
      const defaults = {
        perspectiveLength: 100,
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
        //   A
        //   |\
        //   | \
        //   |  \
        //  D|___\E ← move parallax layer
        //   |    \
        //   |_____\ ← mouse deviation from centre
        //   B      C

        // === перевод градусов в радианы
        function toRad(deg) {
          return (Math.PI * deg) / 180;
        }

        const AB = defaults.perspectiveLength;
        const BC = deviationFromCenter.X;

        // const AB = 100;
        // const BC = 70;

        const AC = Math.sqrt(BC ** 2 + AB ** 2);
        console.log('parallaxDraw -> AC', AC);
        const degA = Math.round((180 / Math.PI) * Math.atan2(BC, AB));
        console.log('parallaxDraw -> degA', degA);
        const degC = 180 - 90 - degA;
        console.log('parallaxDraw -> degC', degC);

        const AD = layerPosition.depth;
        console.log('parallaxDraw -> AD', AD);
        const degE = degC;
        console.log('parallaxDraw -> degE', degE);
        const radE = toRad(degE);
        const sinE = Math.sin(radE);
        const AE = AD / sinE;
        console.log('parallaxDraw -> AE', AE);
        const tanE = Math.tan(radE);
        console.log('parallaxDraw -> tanE', tanE);
        const DE = AD / tanE;
        console.log('parallaxDraw -> DE', DE);

        $this.css({
          left: parseInt(layerPosition.left) + DE,
          // top: parseInt(layerPosition.top) + deviationFromCenter.Y,
        });
      }

      // === инициализация функций
      $(window)
        // === после загрузки окна браузера
        .on('load', function() {
          parallaxReady();
        })
        .on('click', function(event) {
          getPositionMouse(event);
          parallaxDraw();
        });
    });
  };
})(jQuery);

jQuery('.parallax-layer').mouseMoveParallax();
// $('.box').mouseMoveParallax();
