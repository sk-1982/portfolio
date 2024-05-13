import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import path from 'path';
import wyw from '@wyw-in-js/vite';
import preload from 'unplugin-inject-preload/vite';
import purgecss from '@fullhuman/postcss-purgecss';
import incstr from 'incstr';

const classNames = new Map<string, string>();
const generator = incstr.idGenerator({
  alphabet: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
});

const getName = (key: string) => {
  if (classNames.has(key)) return classNames.get(key)!;

  let generated: string;
  do {
    generated = generator();
  } while (/^-?\d|^--|^-$|^(ad)$/i.test(generated));

  classNames.set(key, generated);
  return generated;
};

// https://vitejs.dev/config/
export default defineConfig(env => ({
  resolve: {
    alias: {
      '@images': path.resolve(__dirname, './src/assets/images'),
      '@98.css': path.resolve(__dirname, './src/98.module.scss'),
      '@': path.resolve(__dirname, './src/'),
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      'preact/debug': 'preact'
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: (name, filename, css) => {
        if (env.mode === 'development') {
          const i = css.indexOf(`.${name}`);
          const line = css.substr(0, i).split(/[\r\n]/).length;
          const file = path.basename(filename, '.css');

          return `${name}_${file.replace(/[^A-Za-z\d]/g, '_')}_${line}`;
        }

        return getName(`${name}|${filename}`);
      }
    },
    postcss: {
      plugins: [purgecss({
        content: ['./src/**/*.{html,ts,tsx}'],
        safelist: env.mode === 'development' ? [/./] : [/^.{1,3}$/]
      })]
    }
  },
  plugins: [
    preact(),
    wyw({
      include: ['**/*.{ts,tsx}'],
      babelOptions: {
        presets: ['@babel/preset-typescript']
      },
      // https://github.com/callstack/linaria/issues/1379#issuecomment-2020805137
      overrideContext: context => (env.mode === 'development'
        ? { ...context, $RefreshSig$: () => () => () => {} }
        : context),
      classNameSlug: (hash, title) => {
        if (env.mode === 'development')
          return `${title}_${hash}`;
        return getName(`${hash}|${title}`);
      },
      preprocessor: 'none'
    }),
    preload({
      files: [{
        entryMatch: /ms_sans_serif(_bold)?.woff2$/,
        attributes: {
          type: 'font/woff2',
          as: 'font',
          crossorigin: 'anonymous',
        }
      }]
    })
  ],
}));
