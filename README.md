# jQuery plugin: jQueryPluginMoveParallax

**GitHub Pages:**<br>
https://sadcat88.github.io/jQueryPluginMoveParallax/app/prod/<br>

## Pug

<pre>
.parallax
    .parallax-layer.layer_1(data-perspective-depth="30")
    .parallax-layer.layer_2(data-perspective-depth="50")
        .layer__item.item_1.position_t_c
        .layer__item.item_2.position_m_r
        .layer__item.item_2.position_b_l
    .parallax-layer.layer_1(data-perspective-depth="95")
        .layer__item.item_1
</pre>

.parallax<br>
Является классом корневого блока для плагина.<br>
<br>
Композиция делится на слои.<br>
.parallax-layer.layer_1(data-perspective-depth="30")<br>
<br>
.parallax-layer<br>
Общий класс для слоя.<br>
layer_1<br>
Индивидуальный слой для каждого слоя.<br>
Порядок нумерации не имеет значения.<br>
Данный класс необходим для обращения к объектам внутри себя.<br>
Атрибут (data-perspective-depth="30")<br>
является обязательным для правильного расчета эффекта параллакса.<br>
Значение данного атрибута означает удаление слоя от точки нулевой перспективы.<br>
<br>

Каждый слой может хранить в себе неограниченное количество объектов<br>
.layer**item.item_1.position_t_c<br>
.layer**item<br>
Общий класс для всех объектов.<br>
item_1<br>
Индивидуальный класс для каждого объекта.<br>
Внутри одного слоя своя нумерация.<br>
Порядок нумерации не имеет значения.<br>
<br>

### Позиционирование

Каждый слой позиционируется по середине двух осей блока корневого блока .parallax<br>
Для объектов слоя существуют классы для быстрого позиционирования.<br>
.position*t_c<br>
.position*<br>
префикс для позиционирования<br>
t* / m* / b* <br>
вертикальное позиционирование (верх / середина / низ)
l* / c* / r* <br>
горизонтальное позиционирование (лево / центр / право)

## SCSS

Размер корневого блока .parallax
<pre>
.parallax {
  width: 1300px;
  height: 866px;
}
</pre>
<br>

Размер слоев<br>
<pre>
.parallax {
  .layer_1 {
    .item_1 {
      width: 1300px;
      height: 866px;
    }
  }
}
</pre>
Рекомендуется устанавливать равным размеру корневого блока .parallax<br>
<br>

Размер объектов слоя<br>
<pre>
.parallax {
  .layer_1 {
    .item_1 {
      width: 900px;
      height: 219px;
    }
  }
}
</pre>
<br>

Изображение для объекта<br>
<pre>
.parallax {
  background: URL("./0_layer.png") center center no-repeat;

  .layer_1 {
    .item_1 {
      background: URL("./1_layer.png") center center no-repeat;
    }
  }
}
</pre>
Для корневого блока .parallax можно устанавливать изображение,<br>
которое будет являться статичным фоновым изображением всей композиции.<br>
<br>

Произвольное позиционирование объектов<br>
<pre>
.parallax {
  .layer_1 {
    .item_1 {
      bottom: 50px;
      left: 100px;
    }
  }
}
</pre>
