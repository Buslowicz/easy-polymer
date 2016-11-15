/// <reference path="./node_modules/gulpfile.ts/gulpfile.ts.d.ts"/>
import { SequenceTask, Gulpclass, Task } from "gulpfile.ts/Annotations";

import { join } from "path";

const ts = require("gulp-typescript");
const del = require("del");
const gulp = require("gulp");
const tslint = require("gulp-tslint");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const transform = require("gulp-transform");

const TSConfig = require("./tsconfig.json");
const TSOptions = Object.assign({}, TSConfig.compilerOptions, {
  noEmit: false,
  typescript: require("typescript")
});

const es6Project = ts.createProject(Object.assign({}, TSOptions, { target: "es2015" }));
const es5Project = ts.createProject(Object.assign({}, TSOptions, { target: "es5" }));

@Gulpclass()
export class Gulpfile {
  private readonly dest = TSConfig.compilerOptions.outDir;
  private readonly srcTS = TSConfig.files;
  private readonly include = TSConfig.include;

  @Task() clean(cb: Function) {
    return del([ join(this.dest, "**") ], cb);
  }

  @Task() lint() {
    return gulp.src(this.include.concat(this.srcTS)).pipe(tslint({ formatter: "prose" })).pipe(tslint.report());
  }

  @Task() buildHTML() {
    const project = this.buildConfig(es5Project);
    return project
      .pipe(transform(this.htmlWrapper))
      .pipe(rename({ extname: ".html" }))
      .pipe(gulp.dest(join(this.dest, "html")));
  }

  @Task() buildHTMLMin() {
    const project = this.buildConfig(es5Project, false, true);
    return project
      .pipe(transform(this.htmlWrapper))
      .pipe(rename({ extname: ".min.html" }))
      .pipe(gulp.dest(join(this.dest, "html")));
  }

  @Task() buildES5() {
    return this.buildConfig(es5Project, "cjs");
  }

  @Task() buildES5Min() {
    return this.buildConfig(es5Project, "cjs", true);
  }

  @Task() buildES6() {
    return this.buildConfig(es6Project, "es6");
  }

  @SequenceTask() build() {
    return [
      "clean", "lint",
      "buildES5", "buildES6", "buildHTML",
      "buildES5Min", "buildHTMLMin"
    ];
  }

  @Task() default() {
    // return [ "build" ];
    console.log("default task");
  }

  private buildConfig(projectConfig, dest?, min?) {
    let project = gulp.src(this.include.concat(this.srcTS)).pipe(projectConfig());
    if (min) {
      project = project.pipe(uglify());
      if (dest) {
        project = project.pipe(rename({extname: ".min.js"}));
      }
    }
    if (dest) {
      return project.pipe(gulp.dest(join(this.dest, dest)));
    }
    else {
      return project;
    }
  }

  private htmlWrapper(content) {
    let links = [];
    let scripts = [];

    content = content
      .toString()
      .replace(/require\(['"](link|script)!(.*?)['"]\);\n?/g, (m, type, module) => {
        switch (type) {
          case "link":
            links.push(module);
            break;
          case "script":
            scripts.push(module);
            break;
        }
        return "";
      });

    return Buffer.from(
      links.map(module => `<link rel="import" href="${module}">\n`).join("") +
      scripts.map(module => `<script src="${module}"></script>\n`).join("") +
      `<script>\nvar ESP = ESP || {};\n(function(exports){${content}}(ESP));\n</script>`
    );
  }
}
