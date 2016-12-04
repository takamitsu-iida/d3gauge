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
    // pieGauge
    //

    // HTMLのコンテナを取得する
    var pieContainer = d3.select('#pieGauge');

    var pgauge = d3gauge.pieGauge().title('CPU使用率');

    pieContainer
      .append('svg')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 300)
      .attr('height', 200)
      .call(pgauge);

    //
    // rectGauge
    //

    // HTMLのコンテナを取得する
    var rectContainer = d3.select('#rectGauge');

    var rgauge = d3gauge.rectGauge().title('CPU使用率');

    rectContainer
      .append('svg')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 400)
      .attr('height', 130)
      .call(rgauge);

    //
    // 動作テスト
    //
    updateValue();

    setInterval(function() {
      updateValue();
    }, 5 * 1000);

    function updateValue() {
      var d = Math.random() * 100;
      pgauge.update(d);
      rgauge.update(d);
    }
    //
  };
  //
})();
