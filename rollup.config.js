import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

// Get all dependencies from package.json
const dependencies = Object.keys(pkg.dependencies || {});
const peerDependencies = Object.keys(pkg.peerDependencies || {});

// Mark all dependencies as external
const external = [...dependencies, ...peerDependencies];

export default {
  input: 'src/index.js',
  output: {
    file: 'build/bundle.js',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    resolve({
      extensions: ['.js', '.jsx']
    }),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env', '@babel/preset-react'],
      extensions: ['.js', '.jsx']
    }),
    commonjs(),
    terser()
  ],
  external: external
}; 