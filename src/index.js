/*global Handsontable*/
import SplitCellPlugin from './splitCellPlugin';

(function () {
    // You need to register your plugin in order to use it within Handsontable.
    Handsontable.plugins.registerPlugin('splitCellPlugin', SplitCellPlugin)
})();
