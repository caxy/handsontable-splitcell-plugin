/*global Handsontable*/
import Handsontable from 'handsontable';
import SplitCellPlugin from './splitCellPlugin';

// You need to register your plugin in order to use it within Handsontable.
Handsontable.plugins.registerPlugin('splitCellPlugin', SplitCellPlugin);

export default SplitCellPlugin;
