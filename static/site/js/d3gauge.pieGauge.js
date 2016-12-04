/* global d3, d3gauge */

// 2016.12.03
// Takamitsu IIDA

// svgは既に存在する前提
(function() {
  d3gauge.pieGauge = function module() {
    //
    // クラス名定義
    // CSSファイルを参照
    //

    // チャートを配置するレイヤ
    var CLASS_CHART_LAYER = 'piegauge-layer';

    // arcを配置するレイヤ
    var CLASS_ARC_LAYER = 'piegauge-arc-layer';

    // 目盛数字を配置するレイヤ
    var CLASS_TICK_LAYER = 'piegauge-tick-layer';

    // 針を配置するレイヤ
    var CLASS_POINTER_LAYER = 'piegauge-pointer-layer';

    // ラベルのテキスト
    var CLASS_LABEL_TEXT = 'piegauge-label-text';

    // ダミーデータ
    var dummy = [0];

    // 外枠の大きさ(初期値)
    var width = 300;
    var height = 200;

    // 描画領域のマージン
    var margin = {
      top: 30,
      right: 30,
      bottom: 30,
      left: 30
    };

    // 描画領域のサイズw, h
    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;

    // このチャートのタイトル
    var title = '';

    // このモジュールをcall()したコンテナへのセレクタ
    var container;

    // レイヤへのセレクタ
    var chartLayer;

    // 描画領域に収まる円の半径
    var r = w / 2; // widthに依存

    // リングをどのくらい内側に移動するか
    var ringInset = 20;

    // リングの太さ
    var ringWidth = 30;

    // ポインタ
    // 針へのセレクション
    var pointer;
    var pWidth = 10;
    var pHeadLen = Math.round(r * 0.9); // rに依存
    var pTailLen = Math.round(r * 0.1); // rに依存
    /*
          |
          o -pHeadLen
          |
          |
          |
    -pW/2 |  pW/2
     --o--+--o--->x
          |
          o pTailLen
          |
          y
    */
    // 針はoをつなぐ4本のラインで構成
    var pointerDatas = [
      [pWidth / 2, 0],
      [0, -pHeadLen],
      [-(pWidth / 2), 0],
      [0, pTailLen],
      [pWidth / 2, 0]
    ];

    // パスジェネレータ
    // 丸みを付けたければ.curveを指定
    var pointerLine = d3.line(); // .curve(d3.curveMonotoneX);

    // 針の移動に要する時間(ミリ秒)
    var duration = 750;

    // リングの開始角度、終了角度
    var minAngle = -90;
    var maxAngle = 90;
    var angleWidth = maxAngle - minAngle;

    // tick
    var tickFormat = d3.format('.3');
    var tickInset = 10;

    // 入力ドメイン
    var minValue = 0;
    var maxValue = 100;

    var scale = d3.scaleLinear();
    scale
      .domain([minValue, maxValue])
      .range([0, 1])
      .clamp(true);

    var majorTicks = 10;
    var ticks = scale.ticks(majorTicks);
    var tickData = d3.range(majorTicks).map(function() {
      return 1 / majorTicks;
    });

    // グラデーションの色合い
    var arcColor = d3.interpolateHcl(d3.rgb('#ffffb2'), d3.rgb('#e31a1c'));

    var arc = d3.arc();
    setArc();

    function setArc() {
      arc
        .innerRadius(r - ringWidth - ringInset)
        .outerRadius(r - ringInset)
        .startAngle(function(d, i) {
          var ratio = d * i;
          return deg2rad(minAngle + (ratio * angleWidth));
        })
        .endAngle(function(d, i) {
          var ratio = d * (i + 1);
          return deg2rad(minAngle + (ratio * angleWidth));
        });
    }

    function deg2rad(deg) {
      return deg * Math.PI / 180;
    }

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

        // 半円を表示
        var arcLayerAll = chartLayer.selectAll('.' + CLASS_ARC_LAYER).data(dummy);
        var arcLayer = arcLayerAll
          .enter()
          .append('g')
          .classed(CLASS_ARC_LAYER, true)
          .merge(arcLayerAll)
          .attr('transform', 'translate(' + r + ',' + r + ')');

        var arcPathAll = arcLayer.selectAll('path').data(tickData);
        arcPathAll
          .enter()
          .append('path')
          .merge(arcPathAll)
          .attr('fill', function(d, i) {
            return arcColor(d * i);
          })
          .attr('d', arc);

        // ticks値を表示
        var tickLayerAll = chartLayer.selectAll('.' + CLASS_TICK_LAYER).data(dummy);
        var tickLayer = tickLayerAll
          .enter()
          .append('g')
          .classed(CLASS_TICK_LAYER, true)
          .merge(tickLayerAll)
          .attr('transform', 'translate(' + r + ',' + r + ')');

        var tickTextAll = tickLayer.selectAll('text').data(ticks);
        tickTextAll
          .enter()
          .append('text')
          .merge(tickTextAll)
          .attr('transform', function(d) {
            var ratio = scale(d);
            var newAngle = minAngle + (ratio * angleWidth);
            return 'rotate(' + newAngle + ') translate(0,' + (tickInset - r) + ')';
          })
          .text(tickFormat);

        // ポインタを表示
        var pointerLayerAll = chartLayer.selectAll('.' + CLASS_POINTER_LAYER).data(dummy);
        var pointerLayer = pointerLayerAll
          .enter()
          .append('g')
          .classed(CLASS_POINTER_LAYER, true)
          .merge(pointerLayerAll)
          .attr('transform', 'translate(' + r + ',' + r + ')');

        var pointerAll = pointerLayer.selectAll('.pointer').data([pointerDatas]);
        pointer = pointerAll
          .enter()
          .append('path')
          .classed('pointer', true)
          .merge(pointerAll)
          .attr('d', pointerLine)
          .attr('transform', 'rotate(' + minAngle + ')');

        // チャートのタイトルを表示
        var labelAll = chartLayer.selectAll('.' + CLASS_LABEL_TEXT).data([title]);
        labelAll
          .enter()
          .append('text')
          .classed(CLASS_LABEL_TEXT, true)
          .merge(labelAll)
          .attr('transform', 'translate(' + (w / 2) + ',' + h + ')')
          .attr('text-anchor', 'middle')
          .attr('dy', '.5em')
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
      var ratio = scale(_);
      var newAngle = minAngle + (ratio * angleWidth);
      var t = d3.transition().ease(d3.easeElastic).duration(duration);
      pointer
        .transition(t)
        .attr('transform', 'rotate(' + newAngle + ')');
      return this;
    };

    exports.width = function(_) {
      if (!arguments.length) {
        return width;
      }
      width = _;
      w = width - margin.left - margin.right;
      r = d3.min([w, h]) / 2;
      pHeadLen = Math.round(r * 0.9);
      pTailLen = Math.round(r * 0.1);
      return this;
    };

    exports.height = function(_) {
      if (!arguments.length) {
        return height;
      }
      height = _;
      h = height - margin.top - margin.bottom;
      r = d3.min([w, h]) / 2;
      pHeadLen = Math.round(r * 0.9);
      pTailLen = Math.round(r * 0.1);
      return this;
    };

    exports.maxAngle = function(_) {
      if (!arguments.length) {
        return maxAngle;
      }
      maxAngle = _;
      angleWidth = maxAngle - minAngle;
      setArc();
      return this;
    };

    exports.minAngle = function(_) {
      if (!arguments.length) {
        return minAngle;
      }
      minAngle = _;
      angleWidth = maxAngle - minAngle;
      setArc();
      return this;
    };

    exports.minValue = function(_) {
      if (!arguments.length) {
        return minValue;
      }
      minValue = _;
      scale.domain([minValue, maxValue]);
      exports.majorTicks(majorTicks);
      return this;
    };

    exports.maxValue = function(_) {
      if (!arguments.length) {
        return maxValue;
      }
      maxValue = _;
      scale.domain([minValue, maxValue]);
      exports.majorTicks(majorTicks);
      return this;
    };

    exports.majorTicks = function(_) {
      if (!arguments.length) {
        return majorTicks;
      }
      majorTicks = _;
      ticks = scale.ticks(majorTicks);
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
