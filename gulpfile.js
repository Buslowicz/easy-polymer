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

function lint(src) {
  return new Promise((resolve, reject) => gulp.src(src)
    .pipe(tsLint({formatter: "prose"}))
    .pipe(tsLint.report())
    .on("end", resolve)
    .on("error", reject)
  );
}

function build({format, minify = false, isDefaultFormat = false}) {
  let rollupOptions = {
    format,
    entry: "index.ts",
    moduleName: "ESP",
    sourceMap: false,
    plugins: [
      typescript({
        typescript: require("typescript"),
        noEmit: false,
        include: `**/*.ts`
      })
    ]
  };

  if (isDefaultFormat) {
    format = "";
  } else {
    format = `.${format}`;
  }

  if (minify) {
    rollupOptions.plugins.push(uglify());
  }

  // TODO: room for improvements?
  return new Promise((resolve, reject) =>
    rollup(rollupOptions)
      .pipe(source("index.ts"))
      .pipe(buffer())
      .pipe(sourcemaps.init())
      .pipe(rename(`index${format}${minify ? ".min" : ""}.js`))
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest("."))
      .on("error", reject)
      .on("end", resolve));
}

function htmlWrapModule(src) {
  return new Promise((resolve, reject) => {
    let fileName = src.endsWith("min.js") ? "index.min" : "index";
    fs.writeFile(`${fileName}.html`, `<script src="${fileName}.js"></script>`, (err) => {
      err ? reject(err) : resolve();
    });
  });
}

gulp.task("build", () => {
  lint("index.ts")
    .then(() => Promise.all([
      build({format: 'es'}),
      build({format: 'umd', isDefaultFormat: true}),
      build({format: 'umd', isDefaultFormat: true, minify: true})
    ]))
    .then(() => Promise.all([
      htmlWrapModule("index.js"),
      htmlWrapModule("index.min.js")
    ]))
    .catch(err => console.error(err.message));
});