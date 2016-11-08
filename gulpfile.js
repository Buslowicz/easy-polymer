const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const tsLint = require("gulp-tslint");
const rename = require("gulp-rename");
const wrapper = require("gulp-wrapper");
const buffer = require("vinyl-buffer");
const rollup = require("rollup-stream");
const source = require("vinyl-source-stream");
const typescript = require("rollup-plugin-typescript");
const uglify = require("rollup-plugin-uglify");

const packageJson = require("./package.json");
const CONFIG = packageJson.config;

// TODO: generate html wrappers as separate files pulling iife instead of putting raw code inside

function lint(src) {
  return new Promise((resolve, reject) => gulp.src(src)
    .pipe(tsLint({formatter: "prose"}))
    .pipe(tsLint.report())
    .on("end", resolve)
    .on("error", reject)
  );
}

function build({main, src, outFile, dist, format, intro, minify = false}) {
  let mainPath = `${src}/${main}.ts`;

  let rollupOptions = {
    format, intro,
    entry: mainPath,
    moduleName: packageJson.name,
    sourceMap: true,
    plugins: [
      typescript({
        typescript: require("typescript"),
        noEmit: false,
        include: `**/*.ts`
      })
    ]
  };

  if (minify) {
    rollupOptions.plugins.push(uglify());
  }

  // TODO: room for improvements?
  return new Promise((resolve, reject) =>
    rollup(rollupOptions)
      .pipe(source(mainPath))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(rename(outFile || `${main}.${format}${minify ? ".min" : ""}.js`))
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(dist))
      .on("error", reject)
      .on("end", resolve));
}

function generateBuildTask({name, config, actions}) {
  gulp.task(name, () => lint("index.ts")
    .then(() => Promise.all(config.formats.map((bundle) => {
      let [format, minify] = bundle.split(":");

      return build({
        main: config.entry,
        src: config.src,
        dist: config.dist,
        intro: config.intro,
        format: format,
        minify: minify,

        outFile: config.outFile
      });
    })))
    .then(actions && (() => Promise.all(actions.map(action => action()))))
    .catch(err => console.error(err.message)));
}

function htmlWrapModule(src) {
  let [, dir, name] = src.match(/(.*)\/([^.\/]+)(\.[\w]+)?(\.min)?\.js/) || [];
  if (!dir || !name) {
    return () => Promise.reject("html wrapper has no name or path");
  }
  return () => new Promise((resolve, reject) => {
    let min = src.endsWith("min.js") ? ".min" : "";
    let fileName = `${name}${min}.html`;
    fs.writeFile(path.join(dir, fileName), `<script src="${name}.iife${min}.js"></script>`, (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
}

generateBuildTask({
  name: "build", config: CONFIG.app, actions: [
    htmlWrapModule(`${CONFIG.app.dist}/${CONFIG.app.entry}.iife.js`),
    htmlWrapModule(`${CONFIG.app.dist}/${CONFIG.app.entry}.iife.min.js`)
  ]
});
