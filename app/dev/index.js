'use strict';
jQuery.noConflict();
(($) => {
  $.fn.mouseMoveParallax = function() {
    return this.each(function() {
      // === настройки по умолчанию
      const defaults = {
        qtyLayers: 100,
        perspectiveLength: 1000,
      };

      // === глобальные переменные
      const $this = $(this);
      // глобальный this для данного плагина
      let windowParameters = {};
      // объект с размерами окна и точкой центра
      let deviationFromCenter = {};
      //  объект с координатами отклонения курсора от центра окна
      let elementPosition = {};
      // объект хранящий координаты position top/left для перемещаемого объекта

      console.log($this);

      // const parallaxItemPosition = ;

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
        console.log('parallaxReady -> windowParameters', windowParameters);

        elementPosition = {
          top: $this.css('top'),
          left: $this.css('left'),
        };
        console.log('parallaxReady -> elementPosition', elementPosition);
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
        console.log(
          'getPositionMouse -> deviationFromCenter',
          deviationFromCenter
        );
      }

      // === нарисовать композицию в зависимости от координат курсора
      function parallaxDraw() {
        //   A
        //   |\
        //   | \
        //   |  \
        //   |   \
        //   |____\
        //   B     C

        const BC = deviationFromCenter.X;
        const AB = defaults.perspectiveLength;
        const AC = Math.sqrt(BC ** 2 + AB ** 2);
        const angleA = (180 / Math.PI) * Math.atan2(BC, AB);
        const angleC = 180 - 90 - angleA;

        $this.css({
          left: parseInt(elementPosition.left) + deviationFromCenter.X,
          top: parseInt(elementPosition.top) + deviationFromCenter.Y,
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
// $('.box').mouseMoveParallax();
