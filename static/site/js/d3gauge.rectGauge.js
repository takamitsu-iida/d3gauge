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
    var CLASS_POINTER_NEEDLE = 'rectgauge-pointer-needle';
    var CLASS_POINTER_LABEL = 'rectgauge-pointer-label';

    // ラベルのテキスト
    var CLASS_TITLE_TEXT = 'rectgauge-title-text';

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
        .rangeRound([0, w])
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
    var pointerLayer; // レイヤごと動かす
    var pointerLabel; // 'text'へのセレクション
    var pWidth = 18;
    var pHeight = 18;
    /*
          |
       o  |  o (pWidth/2, -pHeight)
          |
          |
          o (0, 0)
   -------+------>x
          |
          y
    */
    // 針はoをつなぐ3本のラインで構成
    var pointerDatas = [
      [0, 0],
      [pWidth / 2, -pHeight],
      [-pWidth / 2, -pHeight]
    ];

    // ポインタ用のパスジェネレータ
    var pointerLine = d3.line();

    // call()されたときに呼ばれる公開関数
    function exports(_selection) {
      container = _selection;
      _selection.each(function(_data) {
        var newValue = (_data) ? _data : minValue;
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
        pointerLayer = pointerLayerAll
          .enter()
          .append('g')
          .classed(CLASS_POINTER_LAYER, true)
          .merge(pointerLayerAll);

        var pointerNeedleAll = pointerLayer.selectAll('.' + CLASS_POINTER_NEEDLE).data([pointerDatas]);
        pointerNeedleAll
          .enter()
          .append('path')
          .classed(CLASS_POINTER_NEEDLE, true)
          .merge(pointerNeedleAll)
          .attr('d', pointerLine);

        var pointerLabelAll = pointerLayer.selectAll('.' + CLASS_POINTER_LABEL).data([newValue]);
        pointerLabel = pointerLabelAll
          .enter()
          .append('text')
          .classed(CLASS_POINTER_LABEL, true)
          .merge(pointerLabelAll)
          .attr('x', pWidth)
          .attr('dy', '-0.5em')
          .text(function(d) {
            return d;
          });

        // チャートのタイトルを表示
        var titleAll = chartLayer.selectAll('.' + CLASS_TITLE_TEXT).data([title]);
        titleAll
          .enter()
          .append('text')
          .classed(CLASS_TITLE_TEXT, true)
          .merge(titleAll)
          .attr('transform', 'translate(0,' + (h + margin.bottom) + ')')
          .attr('dy', '-0.5em')
          .text(function(d) {
            return d;
          });

        update(newValue);
        //
      });
    }

    function update(_) {
      if (!arguments.length) {
        return this;
      }
      pointerLabel.text(tickFormat(_));
      var x = xScale(_);
      var t = d3.transition().ease(d3.easeElastic).duration(duration);
      pointerLayer
        .transition(t)
        .attr('transform', 'translate(' + x + ',0)');
      return this;
    }

    exports.update = function(_) {
      return update(_);
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
