import path from 'path';
import * as sass from 'sass';
import { metadata } from '../data/metadata';
import noModificationsResult from '../data/compilation-results/no-changes-css';
import noModificationsMeta from '../data/compilation-results/no-changes-meta';

import CompileManager from '../../src/modules/compile-manager';

const dataPath = path.join(path.resolve(), 'tests', 'data');

jest.mock('../../src/modules/bundle-resolver', () => ({
  __esModule: true,
  default: (): sass.SyncOptions => ({
    file: path.join(dataPath, 'scss', 'bundles', 'dx.light.scss'),
    includePaths: [path.join(dataPath, 'scss', 'widgets', 'generic')],
  }),
}));

jest.mock('../../src/data/metadata/dx-theme-builder-metadata', () => ({
  __esModule: true,
  metadata,
}));

describe('Compile manager - integration test on test sass', () => {
  test('compile test bundle without swatch', () => {
    const manager = new CompileManager();
    return manager.compile({}).then((result) => {
      expect(result.css).toBe(noModificationsResult);
      expect(result.compiledMetadata).toEqual(noModificationsMeta);
    });
  });

  test('compile test bundle with swatch', () => {
    const manager = new CompileManager();
    return manager.compile({
      makeSwatch: true,
      outColorScheme: 'test-theme',
    }).then((result) => {
      expect(result.css).toBe(`.dx-swatch-test-theme .dx-accordion {
  background-color: "Helvetica Neue", "Segoe UI", Helvetica, Verdana, sans-serif;
  color: #337ab7;
  font: url("icons/icons.woff2");
}
.dx-swatch-test-theme .dx-accordion .from-base {
  background-color: transparent;
  color: #337ab7;
}`);
      expect(result.compiledMetadata).toEqual(noModificationsMeta);
    });
  });

  test('compile test bundle with assetsBasePath', () => {
    const manager = new CompileManager();
    return manager.compile({
      assetsBasePath: 'base-path',
    }).then((result) => {
      expect(result.css).toBe(`.dx-accordion {
  background-color: "Helvetica Neue", "Segoe UI", Helvetica, Verdana, sans-serif;
  color: #337ab7;
  font: url("base-path/icons/icons.woff2");
}
.dx-accordion .from-base {
  background-color: transparent;
  color: #337ab7;
}`);
      expect(result.compiledMetadata).toEqual(noModificationsMeta);
    });
  });

  test('compile test bundle with widgets option', () => {
    const manager = new CompileManager();
    return manager.compile({
      widgets: ['datebox'],
    }).then((result) => {
      expect(result.css).toBe('');
      expect(result.compiledMetadata).toEqual([{
        Key: '$base-font-family',
        Path: 'tb/widgets/generic/colors',
        Value: '"Helvetica Neue","Segoe UI",Helvetica,Verdana,sans-serif',
      }, {
        Key: '$base-accent',
        Path: 'tb/widgets/generic/colors',
        Value: 'rgba(51,122,183,1)',
      }]);
    });
  });

  test('compile test bundle with error', () => {
    const manager = new CompileManager();
    return expect(manager.compile({
      makeSwatch: true,
      outColorScheme: 'error for sass compiler :)',
    })).rejects.toBeInstanceOf(Error);
  });
});
