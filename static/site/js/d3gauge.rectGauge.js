/* global d3, d3gauge */

// 2016.12.03
// Takamitsu IIDA

// svgは既に存在する前提
(function() {
  d3gauge.rectGauge = function module() {
    //
    // クラス名定義
    // CSSファイルを参照
    //

    // チャートを配置するレイヤ
    var CLASS_CHART_LAYER = 'rectgauge-layer';

    // 目盛数字を配置するレイヤ
    var CLASS_TICK_LAYER = 'rectgauge-tick-layer';

    // 針を配置するレイヤ
    var CLASS_POINTER_LAYER = 'rectgauge-pointer-layer';

    // ラベルのテキスト
    var CLASS_LABEL_TEXT = 'rectgauge-label-text';

    // ダミーデータ
    var dummy = [0];

    // 外枠の大きさ(初期値)
    var width = 360;
    var height = 130;

    // 描画領域のマージン
    var margin = {
      top: 40,
      right: 30,
      bottom: 60,
      left: 30
    };

    // 描画領域のサイズw, h
    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;

    // このチャートのタイトル
    var title = '';

    var duration = 750;

    // このモジュールをcall()したコンテナへのセレクタ
    var container;

    // レイヤへのセレクタ
    var chartLayer;

    // グラデーションの色合い
    var rectColor = d3.interpolateHcl(d3.rgb('#ffffb2'), d3.rgb('#e31a1c'));

    // 入力ドメイン
    var minValue = 0;
    var maxValue = 100;

    var xScale = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([0, w])
        .clamp(true);

    // tick
    var tickFormat = d3.format('.3');
    var majorTicks = 10;

    // 目盛になる数字の配列
    // ticksは[0, 10, 20, 30, ...]
    var ticks = xScale.ticks(majorTicks);

    // 0-1に正規化しているので要注意
    // [0.1, 0.1, 0.1, ...]
    var tickData = d3.range(majorTicks).map(function() {
      return 1 / majorTicks;
    });

    var rectWidth = xScale((maxValue - minValue) / majorTicks);

    // ポインタ
    // 針へのセレクション
    var pointer;
    var pWidth = 6;
    var pHeadLen = Math.round(Number(h) * 1.1);
    var pTailLen = Math.round(Number(h) * 0.1);
    /*
          |
          o -pTailLen
          |
    -pW/2 |  pW/2
     --o--+--o--->x
          |
          |
          |
          o pHeadLen
          |
          y
    */
    // 針はoをつなぐ4本のラインで構成
    var pointerDatas = [
      [pWidth / 2, 0],
      [0, -pTailLen],
      [-(pWidth / 2), 0],
      [0, pHeadLen],
      [pWidth / 2, 0]
    ];

    // ポインタ用のパスジェネレータ
    // 丸みを付けたければ.curveを指定
    var pointerLine = d3.line(); // .curve(d3.curveMonotoneX);

    // call()されたときに呼ばれる公開関数
    function exports(_selection) {
      container = _selection;
      _selection.each(function(_data) {
        var newValue = _data;
        //
        var chartLayerAll = container.selectAll('.' + CLASS_CHART_LAYER).data(dummy);
        chartLayer = chartLayerAll
          .enter()
          .append('g')
          .classed(CLASS_CHART_LAYER, true)
          .merge(chartLayerAll)
          .attr('width', w)
          .attr('height', h)
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var rectAll = chartLayer.selectAll('rect').data(tickData);
        rectAll
          .enter()
          .append('rect')
          .merge(rectAll)
          .attr('x', function(d, i) {
            var ratio = d * i;
            return xScale(minValue + ratio * maxValue);
          })
          .attr('width', rectWidth)
          .attr('height', h)
          .attr('fill', function(d, i) {
            return rectColor(d * i);
          });

        rectAll.exit().remove();

        // ticks値を表示
        var tickLayerAll = chartLayer.selectAll('.' + CLASS_TICK_LAYER).data(dummy);
        var tickLayer = tickLayerAll
          .enter()
          .append('g')
          .classed(CLASS_TICK_LAYER, true)
          .merge(tickLayerAll)
          .attr('transform', 'translate(0,' + (h + 20) + ')');

        var tickTextAll = tickLayer.selectAll('text').data(ticks);
        tickTextAll
          .enter()
          .append('text')
          .merge(tickTextAll)
          .attr('x', function(d) {
            return xScale(d);
          })
          .attr('text-anchor', 'middle')
          .text(tickFormat);

        // ポインタを表示
        var pointerLayerAll = chartLayer.selectAll('.' + CLASS_POINTER_LAYER).data(dummy);
        var pointerLayer = pointerLayerAll
          .enter()
          .append('g')
          .classed(CLASS_POINTER_LAYER, true)
          .merge(pointerLayerAll);

        var pointerAll = pointerLayer.selectAll('.pointer').data([pointerDatas]);
        pointer = pointerAll
          .enter()
          .append('path')
          .classed('pointer', true)
          .merge(pointerAll)
          .attr('d', pointerLine);
          // .attr('transform', 'translate(0)');

        // チャートのタイトルを表示
        var labelAll = chartLayer.selectAll('.' + CLASS_LABEL_TEXT).data([title]);
        labelAll
          .enter()
          .append('text')
          .classed(CLASS_LABEL_TEXT, true)
          .merge(labelAll)
          .attr('transform', 'translate(' + (w / 2) + ',' + (h + 40) + ')')
          .attr('fill', '#000')
          .attr('text-anchor', 'middle')
          .text(function(d) {
            return d;
          });

        exports.update(newValue === undefined ? 0 : newValue);
        //
      });
    }

    exports.update = function(_) {
      if (!arguments.length) {
        return this;
      }
      var x = xScale(_);
      var t = d3.transition().ease(d3.easeElastic).duration(duration);
      pointer
        .transition(t)
        .attr('transform', 'translate(' + x + ',0)');
      return this;
    };

    exports.width = function(_) {
      if (!arguments.length) {
        return width;
      }
      width = _;
      w = width - margin.left - margin.right;
      return this;
    };

    exports.height = function(_) {
      if (!arguments.length) {
        return height;
      }
      height = _;
      h = height - margin.top - margin.bottom;
      return this;
    };

    exports.minValue = function(_) {
      if (!arguments.length) {
        return minValue;
      }
      minValue = _;
      xScale.domain([minValue, maxValue]);
      exports.majorTicks(majorTicks);
      return this;
    };

    exports.maxValue = function(_) {
      if (!arguments.length) {
        return maxValue;
      }
      maxValue = _;
      xScale.domain([minValue, maxValue]);
      exports.majorTicks(majorTicks);
      return this;
    };

    exports.majorTicks = function(_) {
      if (!arguments.length) {
        return majorTicks;
      }
      majorTicks = _;
      ticks = xScale.ticks(majorTicks);
      tickData = d3.range(majorTicks).map(function() {
        return 1 / majorTicks;
      });
      return this;
    };

    exports.duration = function(_) {
      if (!arguments.length) {
        return duration;
      }
      duration = _;
      return this;
    };

    exports.title = function(_) {
      if (!arguments.length) {
        return title;
      }
      title = _;
      return this;
    };

    return exports;
  };

  //
})();
