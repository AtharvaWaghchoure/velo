import { useState } from 'react'
import { useTradingContract } from '../hooks/useContract'
import { parseEther, formatEther } from 'viem'

const PositionManager = ({ currentPrice }) => {
  const { position, openPosition, closePosition, addMargin, removeMargin } = useTradingContract()
  const [marginAmount, setMarginAmount] = useState('')
  const [positionSize, setPositionSize] = useState('')
  const [leverage, setLeverage] = useState(1)
  const [isLong, setIsLong] = useState(true)

  const handleOpenPosition = async () => {
    try {
      const size = parseEther(positionSize)
      const price = parseEther(currentPrice.toString())
      await openPosition({
        args: [size, isLong, leverage, price],
      })
    } catch (error) {
      console.error('Error opening position:', error)
    }
  }

  const handleClosePosition = async () => {
    try {
      const price = parseEther(currentPrice.toString())
      await closePosition({
        args: [price],
      })
    } catch (error) {
      console.error('Error closing position:', error)
    }
  }

  return (
    <div className="space-y-4 p-4 bg-gray-900 rounded-lg">
      {position && position.size > 0 ? (
        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Current Position</h3>
          <div className="space-y-2">
            <p>Size: {formatEther(position.size)} USD</p>
            <p>Entry Price: ${formatEther(position.entryPrice)}</p>
            <p>Margin: {formatEther(position.margin)} USD</p>
            <p>Type: {position.isLong ? 'Long' : 'Short'}</p>
            <p>Leverage: {position.leverage}x</p>
            <button
              onClick={handleClosePosition}
              className="w-full mt-4 p-2 bg-red-600 rounded-lg hover:bg-red-700"
            >
              Close Position
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Position Size (USD)</label>
            <input
              type="number"
              value={positionSize}
              onChange={(e) => setPositionSize(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded"
              placeholder="Enter position size"
            />
          </div>

          <div>
            <label className="block mb-2">Leverage</label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full p-2 bg-gray-800 rounded"
            >
              {[1, 2, 5, 10, 20, 50, 100].map((x) => (
                <option key={x} value={x}>{x}x</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsLong(true)}
              className={`flex-1 p-2 rounded ${isLong ? 'bg-green-600' : 'bg-gray-700'}`}
            >
              Long
            </button>
            <button
              onClick={() => setIsLong(false)}
              className={`flex-1 p-2 rounded ${!isLong ? 'bg-red-600' : 'bg-gray-700'}`}
            >
              Short
            </button>
          </div>

          <button
            onClick={handleOpenPosition}
            className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Open Position
          </button>
        </div>
      )}

      {position && position.size > 0 && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Manage Margin</h3>
          <div className="space-y-4">
            <input
              type="number"
              value={marginAmount}
              onChange={(e) => setMarginAmount(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
              placeholder="Enter margin amount"
            />
            <div className="flex gap-2">
              <button
                onClick={() => addMargin({ args: [parseEther(marginAmount)] })}
                className="flex-1 p-2 bg-green-600 rounded hover:bg-green-700"
              >
                Add Margin
              </button>
              <button
                onClick={() => removeMargin({ args: [parseEther(marginAmount), parseEther(currentPrice.toString())] })}
                className="flex-1 p-2 bg-red-600 rounded hover:bg-red-700"
              >
                Remove Margin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PositionManager;