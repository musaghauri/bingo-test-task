import React from 'react'

export default function Board({ active, username, boardCells, checkedCells, isBoxSelectable, pickBox }) {
  return (
    <div>
      <h2 className={`text-xl font-bold text-center ${active ? 'text-green-600' : 'text-gray-800'}`}>{username}</h2>
      <ul className={`grid grid-cols-5 select-none ${!isBoxSelectable ? 'cursor-not-allowed bg-gray-400' : ''} `}>
        {
          boardCells.map((value, i) => (
            <React.Fragment key={value}>
              {i === 12 && (
                <li
                  className="p-6 text-xl font-medium text-center bg-[#5dc4de] border-2 border-gray-300 border-solid">
                  Free
                </li>
              )}
              <li
                onClick={() => typeof isBoxSelectable === 'function' && isBoxSelectable(i) ? pickBox(i, value) : null}
                className={`p-6 text-xl font-medium text-center border-2 border-gray-300 border-solid ${checkedCells.has(i) ? 'bg-[#5dc4de] picked' : ''}`}
              >
                {value}
              </li>
            </React.Fragment>
          ))
        }
      </ul>
    </div>
  )
}
