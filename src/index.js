///////////////////////////////////////////////////////////////////////////////
// SETUP: DEPENDENCIES AND CONSTANTS
///////////////////////////////////////////////////////////////////////////////
import React, {
  useState,
  useCallback,
  useEffect,
  useRef
} from 'react';

import ReactDOM from 'react-dom';

import {
  flatten,
  uniq,
  capitalize,
  isString,
  sortBy,
  reverse,
  isNumber,
  indexOf,
  includes,
  concat,
} from 'lodash';

import './index.css';

// Constants
const AZ = 1;
const ZA = 2;

///////////////////////////////////////////////////////////////////////////////
// DATA GRID COMPONENTS
///////////////////////////////////////////////////////////////////////////////
// A single cell in a data grid
const Cell = ({
  datum,
  classname
}) => {
  return (
    <td className={classname}>
      {
        isString(datum) && datum.toLowerCase().endsWith('.png') ?
          <img src={datum} />
        : isNumber(datum) ?
          datum.toLocaleString()
        :
          datum
      }
    </td>
  );
};

// A cell in a header row in a data grid
const HeaderCell = ({
  title,
  onClick,
}) => {
  return (
    <th id={title} onClick={onClick}>
      {capitalize(title)}
    </th>
  );
};

///////////////////////////////////////////////////////////////////////////////
// DATAGRID COMPONENT WITH INSTANTIATION
///////////////////////////////////////////////////////////////////////////////
const DataGrid = () => {
  // Load the data from JSON, which you can find at:
  // https://assets.codepen.io/5781725/states-data.json
  // We include some data for testing purposes
  const [data, setData] = useState([
   {
      state:"Alabama",
      abbreviation:"AL",
      population:4921532,
      size:52420.07,
   },
   {
      state:"Alaska",
      abbreviation:"AK",
      population:731158,
      size:665384.04,
   },
  ]);
  
  /* TODO: Load the data from the URL */
  const originalData = useRef(data);
  const url = 'https://assets.codepen.io/5781725/states-data.json'
  const fetchData = () => {
    fetch(url)
    .then(res => res.json())
    .then(data => {
      originalData.current = data
      setData(data)
    })
  }
  useEffect(() => {fetchData()},[])

  // Preprocess the data to get a list of columns and add a helper index
  let columns = uniq(flatten(
    data.map((row) => Object.keys(row).filter((key) => !key.startsWith('_')))
  ));

  const originalColumns = useRef(columns);
  originalColumns.current = columns
  const updatedColumns = useRef(columns);
  columns = updatedColumns.current.length === 5 ? updatedColumns.current : columns
  
  // State
  const [sortedOn, setSortedOn] = useState([null, AZ]);
  const [pinnedColumns, setPinnedColumns] = useState([]);

  // Event handlers
  const onClick = useCallback((col) => (event) => {
    if (event.metaKey){ // pinning
      /* TODO: implement the onclick handler for pinning */
      let tempPinnedCol = [...pinnedColumns]
      if (!pinnedColumns.includes(col)) {
        tempPinnedCol.push(col)
        let tempColumns = columns.filter((c) => !tempPinnedCol.includes(c))
        updatedColumns.current = concat(tempPinnedCol,tempColumns)
      } else {
        tempPinnedCol.splice(indexOf(tempPinnedCol,col),1)
        const tempColumns = columns.filter((c) => c !== col)
        tempColumns.push(col)
        updatedColumns.current = tempColumns
      }
      setPinnedColumns(tempPinnedCol)
    } else { // sorting
      /* TODO: implement the onclick handler for sorting */
      const handleRevert = () => {
        setData(originalData.current)
        setSortedOn([null,AZ])
      }

      const handleSort = (val) => {
        let tempData

        if (col === 'flag') {
          let flagName
          data.forEach((row) => {flagName = row.flag.split('of_')[1]})
          tempData = sortBy(data, [flagName])
        }else {
          tempData = sortBy(data, [col])
        }

        if (val === 2) reverse(tempData)
        setData(tempData)
      }

      const column = document.getElementById(col)
      let assendingDiv = document.getElementById('assending')
      let descendingDiv = document.getElementById('descending')

      if (sortedOn[0] === null) {
        const assending = document.createElement('div')
        assending.setAttribute('id','assending')
        const sort = document.createTextNode('  ⬇︎  ')
        assending.appendChild(sort)
        column.appendChild(assending)

        handleSort(sortedOn[1])
        setSortedOn([col, ZA])
      }

      else if (sortedOn[0] === col) {
        if (sortedOn[1] === ZA) {
          assendingDiv.remove()
          const descending = document.createElement('div')
          descending.setAttribute("id","descending")
          const sort = document.createTextNode('  ⬆︎  ')
          descending.appendChild(sort)
          column.appendChild(descending)
          handleSort(sortedOn[1])
          setSortedOn([col, AZ])
        } 
        if (sortedOn[1] === AZ) {
          descendingDiv.remove()
          handleRevert()
        }
      }

      else if (sortedOn[0] !== col) {
        if (assendingDiv) assendingDiv.remove()
        if (descendingDiv) descendingDiv.remove()
        handleRevert()
      }
    }
  }, [data, sortedOn, pinnedColumns]);

  /* TODO: Re-order columns and sort data (if necessary) */

  // Render
  return (
    <table>
      <thead>
        <tr>
          {
            columns.map((col, i) => (
              <HeaderCell
                key={i}
                title={col}
                onClick={onClick(col)}
              />
            ))
          }
        </tr>
      </thead>
      <tbody>

        {
          data.map((row, i) => (
            <tr key={i}>
              {
                columns.map((col, j) => {
                  const classname = includes(pinnedColumns, col) ? 'pinned' : '';
                  return (<Cell key={j} datum={row[col]} classname={classname} />)
                })
              }
            </tr>
          ))
        }
      </tbody>
    </table>
  );
};

// Instantiate
ReactDOM.render(
  <React.StrictMode>

    <DataGrid />
  </React.StrictMode>,
  document.getElementById('root')
);
