/* global d3, d3gauge */

// グローバルに独自の名前空間を定義する
(function() {
  // このthisはグローバル空間
  this.d3gauge = this.d3gauge || (function() {
    // アプリのデータを取り込む場合、appdata配下にぶら下げる
    var appdata = {};

    // ヒアドキュメント経由で静的データを取り込む場合、テキストデータをheredoc配下にぶら下げる
    var heredoc = {};

    // 地図データを取り込む場合、geodata配下にぶら下げる
    var geodata = {};

    // SVGアイコンを取り込む場合、icon配下にぶら下げる
    var icondata = {};

    // 公開するオブジェクト
    return {
      appdata: appdata,
      heredoc: heredoc,
      geodata: geodata,
      icondata: icondata
    };
  })();
  //
})();

// メイン関数
(function() {
  d3gauge.main = function() {
    //
    // rectGauge
    //

    // HTMLのコンテナを取得する
    var rectContainer = d3.select('#rectGauge');

    var rgauge = d3gauge.rectGauge().title('rectGauge');

    rectContainer
      .append('svg')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', rgauge.width())
      .attr('height', rgauge.height())
      .call(rgauge);

    //
    // vrectGauge
    //

    // HTMLのコンテナを取得する
    var vrectContainer = d3.select('#vrectGauge');

    var vgauge = d3gauge.vrectGauge().title('vrectGage');

    vrectContainer
      .append('svg')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', vgauge.width())
      .attr('height', vgauge.height())
      .call(vgauge);

    //
    // pieGauge
    //

    // HTMLのコンテナを取得する
    var pieContainer = d3.select('#pieGauge');

    var pgauge = d3gauge.pieGauge().title('pieGauge');

    pieContainer
      .append('svg')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', pgauge.width())
      .attr('height', pgauge.height())
      .call(pgauge);

    //
    // 動作テスト
    //
    updateValue();

    setInterval(function() {
      updateValue();
    }, 3 * 1000);

    function updateValue() {
      var d = Math.random() * 100;
      rgauge.update(d);
      vgauge.update(d);
      pgauge.update(d);
    }
    //
  };
  //
})();
