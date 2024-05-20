import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import path from 'path';
import wyw from '@wyw-in-js/vite';
import preload from 'unplugin-inject-preload/vite';
import purgeCss from "@mojojoejo/vite-plugin-purgecss";
import incstr from 'incstr';
import autoprefixer from 'autoprefixer';
import { Declaration } from 'postcss';
import { ViteMinifyPlugin } from 'vite-plugin-minify'
import * as sass from 'sass';
import fs from 'fs';

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
      // 'preact/debug': 'preact'
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
      plugins: [{
        postcssPlugin: 'remove',
        Rule: rule => {
          if (rule.selectors.some(s => /(?<![.#])(button|input)/i.test(s))) {
            rule.walkDecls('text-shadow', n => { n.remove() });
            rule.walkDecls('color', n => { n.remove() });
          }

          if (!rule.nodes.every(n => n.type === 'decl'))
            return;
          const style = ([...rule.nodes] as Declaration[])
            .sort((a, b) => a.prop.localeCompare(b.prop, 'en-US'))
            .map(d => `${d.prop}:${d.value}`)
            .join(';');
          const remove = new Set([
            'color:#222;font-family:Arial;font-size:12px',
            '-webkit-font-smoothing:none;font-family:"Pixelated MS Sans Serif",Arial;font-size:11px'
          ]);
          if (remove.has(style))
            rule.remove();
        },
        AtRule: {
          'font-face': rule => {
            let isBold = false;
            let isMsSans = false;

            rule.walkDecls('font-weight', node => {
              if (node.value === 'bold' || node.value === '700')
                isBold = true;
            });

            rule.walkDecls('font-family', node => {
              if (node.value.includes("MS Sans Serif"))
                isMsSans = true;
            });

            if (isBold && isMsSans) {
              rule.remove();
              return;
            }

            rule.walkDecls('src', node => {
              if (/format\("woff"\)/.test(node.value))
                node.remove();
            });
          }
        }
      }, autoprefixer]
    }
  },
  plugins: [
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
      preprocessor: (selector, cssText) => sass.compileString(`${selector} { ${cssText} }`).css
    }),
    preact(),
    preload({
      files: [{
        entryMatch: /ms_sans_serif.woff2$/,
        attributes: {
          type: 'font/woff2',
          as: 'font',
          crossorigin: 'anonymous',
        }
      }]
    }),
    purgeCss({
      blocklist: [/select/i]
    }),
    {
      name: 'process-files',
      writeBundle(opts, bundle) {
        Object.entries(bundle).forEach(([file, data]) => {
          if (/ms_sans_serif_bold/i.test(file) || (/ms_sans_serif/i.test(file) && file.endsWith('.woff')))
            fs.unlinkSync(path.join('dist', file))
        });
      }
    }
  ],
}));
