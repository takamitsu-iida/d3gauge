module.exports = function (grunt) {
  var pkg = grunt.file.readJSON('package.json');

  grunt.file.defaultEncoding = 'utf-8';
  grunt.file.preserveBOM = true;

  grunt.initConfig({
    concat: {
      target_js: {
        // 元ファイルの指定
        src: [
          'static/d3.4.4.0/d3.js',
          'static/site/js/d3gauge.startup.js',
          'static/site/js/d3gauge.pieGauge.js',
          'static/site/js/d3gauge.rectGauge.js',
          'static/site/js/d3gauge.vrectGauge.js',
        ],
        // 出力ファイルの指定
        dest: 'static/site/dist/d3gauge.js'
      },
      target_css: {
        src: [
          'static/site/css/d3gauge.css'
          ],
        dest: 'static/site/dist/d3gauge.css'
      }
    },

    uglify: {
      target_js: {
        files: {
          // 出力ファイル: 元ファイル
          'static/site/dist/d3gauge-min.js': ['static/site/dist/d3gauge.js']
        }
      }
    }
  });

  // プラグインのロード・デフォルトタスクの登録
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat', 'uglify']);
};
