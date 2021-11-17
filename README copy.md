# Webpack 4 Boilerplate Typescript/Sass with build-in option to change preprocessor (less/stylus)
![License MIT](https://img.shields.io/github/license/mwieth/Webpack-4-boilerplate-Typescript)

This Webpack 4 Boilerplate comes with 2 builds:

--> <code>npm run build:dev</code><br>
  starts dev server on <code>localhost:8080</code> with livereload, sourcemap

--> <code>npm run build:prod</code><br>
  creates prod files to <code>/dist</code> with:

  1. compiles sass/stylus/less to css <br>
  2. autoprefixer for vendor prefixes (browser compability)<br>
  3. compiles typescript to ES5 <br>
  4. minifying for css/js <br>
  5. uglyfing js code <br>
  6. hash css and js file (file versioning for browser caching -> cache busting)<br>

# Setup
```sh
git clone https://github.com/mwieth/Webpack-4-boilerplate-Typescript.git
cd Webpack-4-boilerplate-Typescript
npm instatll
//start dev mode
npm start
```