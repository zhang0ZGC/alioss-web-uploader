import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import commonjs from "rollup-plugin-commonjs";
import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';
// import analyze from 'rollup-plugin-analyzer'
// import { uglify } from 'rollup-plugin-uglify'
import {terser} from 'rollup-plugin-terser'

// const env = process.env.NODE_ENV;
const noDeclarationFiles = {compilerOptions: {declaration: false}};
const pkgName = 'alioss-web-uploader';

const config = [
  // CommonJS
  {
    input: 'src/index.ts',
    output: {
      file: `lib/${pkgName}.js`,
      format: 'cjs',
      indent: false,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({useTsconfigDeclarationDir: true}),
      babel(),
    ]
  },

  // UMD production
  {
    input: 'src/index.ts',
    output: {
      file: `dist/${pkgName}.min.js`,
      format: 'umd',
      name: 'AliOSSWebUploader',
      indent: false,
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({tsconfigOverride: noDeclarationFiles}),
      babel({
        exclude: 'node_modules/**'
      }),
      // uglify(),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
        output: {
          comments: false,
        },
      }),
      filesize(),
    ]
  },

  // UMD development
  {
    input: 'src/index.ts',
    output: {
      file: `dist/${pkgName}.js`,
      format: 'umd',
      name: 'AliOSSWebUploader',
      sourcemap: true,
      // footer: '/* @see https://github.com */',
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({tsconfigOverride: noDeclarationFiles}),
      filesize(),
      babel({
        exclude: 'node_modules/**'
      }),
    ]
  },
];

export default config;
