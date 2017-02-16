/*global Handsontable*/
import _ from 'lodash'
import Handsontable from 'handsontable'

class SplitCellPlugin extends Handsontable.plugins.BasePlugin {
  isEnabled () {
    return !!this.hot.getSettings().splitCellPlugin
  }

  /**
   * The enablePlugin method is triggered on the beforeInit hook. It should contain your initial plugin setup, along with
   * the hook connections.
   * Note, that this method is run only if the statement in the isEnabled method is true.
   */
  enablePlugin () {
    // Add all your plugin hooks here.
    this.addHook('afterContextMenuDefaultOptions', this.addSplitActionsToContextMenu.bind(this))

    super.enablePlugin()
  }

  /**
   * @param defaultOptions
   */
  addSplitActionsToContextMenu (defaultOptions) {
    if (!this.hot.getSettings().splitCellPlugin) {
      return
    }

    defaultOptions.items.push({
      key: 'splitCellHorizontally',
      name: 'Split Cell Horizontally',
      callback: () => this.splitCellHorizontally(),
      disabled: () => this.isContextMenuDisabled()
    })

    defaultOptions.items.push({
      key: 'splitCellVertically',
      name: 'Split Cell Vertically',
      callback: () => this.splitCellVertically(),
      disabled: () => this.isContextMenuDisabled()
    })
  }

  isContextMenuDisabled () {
    const selected = this.hot.getSelected()
    const [startRow, startCol, endRow, endCol] = selected
    const [topRow, leftCol] = [Math.min(startRow, endRow), Math.min(startCol, endCol)]
    let rowDiff = Math.abs(startRow - endRow)
    let colDiff = Math.abs(startCol - endCol)

    const mergedCell = this.hot.mergeCells.mergedCellInfoCollection.getInfo(topRow, leftCol)

    if (mergedCell) {
      rowDiff -= (mergedCell.rowspan - 1)
      colDiff -= (mergedCell.colspan - 1)
    }

    return rowDiff > 0 || colDiff > 0
  }

  splitCellHorizontally () {
    this.splitCell('right')
  }

  splitCellVertically () {
    this.splitCell('down')
  }

  /**
   * @param direction (right|down)
   */
  splitCell (direction) {
    const selected = this.hot.getSelected()
    const [startRow, startCol] = selected
    const mergedCell = this.hot.mergeCells.mergedCellInfoCollection.getInfo(startRow, startCol)

    if (mergedCell && mergedCell[direction === 'right' ? 'colspan' : 'rowspan'] > 1) {
      this.splitMergedCell(mergedCell, direction)
    } else {
      this.splitUnmergedCell(startRow, startCol, mergedCell, direction)
    }
  }

  /**
   * @param mergedCell
   * @param direction
   */
  splitMergedCell (mergedCell, direction) {
    let newCell = {}
    if (direction === 'right') {
      mergedCell.colspan--
      newCell = _.clone(mergedCell)
      newCell.col = mergedCell.col + mergedCell.colspan
      newCell.colspan = 1
    } else {
      mergedCell.rowspan--
      newCell = _.clone(mergedCell)
      newCell.row = mergedCell.row + mergedCell.rowspan
      newCell.rowspan = 1
    }

    if (mergedCell.rowspan === 1 && mergedCell.colspan === 1) {
      this.hot.mergeCells.mergedCellInfoCollection.removeInfo(mergedCell.row, mergedCell.col)
    } else {
      this.hot.mergeCells.mergedCellInfoCollection.setInfo(mergedCell)
      this.hot.mergeCells.mergedCellInfoCollection.setInfo(newCell)
    }

    this.hot.render()
  }

  /**
   *
   * @param startRow
   * @param startCol
   * @param mergedCell
   * @param direction
   */
  splitUnmergedCell (startRow, startCol, mergedCell, direction) {
    const data = this.applySplitToData(direction, startCol, startRow, mergedCell)

    this.shiftCellsAfterSplit(direction, data, startRow, startCol)

    this.hot.loadData(data)
  }

  /**
   *
   * @param direction
   * @param startCol
   * @param startRow
   * @param mergedCell
   * @returns {*}
   */
  applySplitToData (direction, startCol, startRow, mergedCell) {
    const newCellIndex = direction === 'right' ? startCol + 1 : startRow + 1
    const newCell = {
      row: startRow,
      col: startCol,
      rowspan: direction === 'right' && mergedCell ? mergedCell.rowspan : 1,
      colspan: direction === 'right' || !mergedCell ? 1 : mergedCell.colspan
    }

    newCell[direction === 'right' ? 'col' : 'row']++

    this.hot.mergeCells.shiftCollection(direction, newCellIndex, 1)

    let data = this.hot.getData()
    if (direction === 'right') {
      data = _.map(data, (row) => {
        row.splice(startCol + 1, 0, '')
        return row
      })
    } else {
      data.splice(startRow + 1, 0, _.map(this.hot.getDataAtRow(startRow), () => ''))
    }

    this.hot.mergeCells.mergedCellInfoCollection.setInfo(newCell)

    return data
  }

  /**
   *
   * @param direction
   * @param data
   * @param startRow
   * @param startCol
   */
  shiftCellsAfterSplit (direction, data, startRow, startCol) {
    const loopCount = direction === 'right' ? data.length : this.hot.getDataAtRow(startRow).length
    const currentCellIndex = direction === 'right' ? startRow : startCol

    for (let i = 0; i < loopCount; i++) {
      const x = direction === 'right' ? i : startRow
      const y = direction === 'right' ? startCol : i
      let mergeParent = this.hot.mergeCells.mergedCellInfoCollection.getInfo(x, y)

      if (i === currentCellIndex) {
        if (mergeParent) {
          i += (mergeParent[direction === 'right' ? 'rowspan' : 'colspan'] - 1)
        }

        continue
      }

      if (!mergeParent) {
        mergeParent = {
          row: x,
          col: y,
          colspan: 1,
          rowspan: 1
        }
      }

      mergeParent[direction === 'right' ? 'colspan' : 'rowspan']++

      this.hot.mergeCells.mergedCellInfoCollection.setInfo(mergeParent)

      i += (mergeParent[direction === 'right' ? 'rowspan' : 'colspan'] - 1)
    }
  }
}

export default SplitCellPlugin
