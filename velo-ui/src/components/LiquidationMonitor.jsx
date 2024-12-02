import { useEffect } from 'react'
import { useTradingContract } from '../hooks/useContract'
import { formatEther } from 'viem'

const LiquidationMonitor = ({ currentPrice }) => {
  const { position } = useTradingContract()

  const calculateLiquidationPrice = () => {
    if (!position || position.size === 0) return 0
    
    const margin = Number(formatEther(position.margin))
    const size = Number(formatEther(position.size))
    const entryPrice = Number(formatEther(position.entryPrice))
    const liquidationThreshold = 0.8 // 80%
    
    if (position.isLong) {
      return entryPrice * (1 - (margin * liquidationThreshold) / (size * entryPrice))
    } else {
      return entryPrice * (1 + (margin * liquidationThreshold) / (size * entryPrice))
    }
  }

  useEffect(() => {
    if (position && position.size > 0) {
      const liquidationPrice = calculateLiquidationPrice()
      if (Math.abs(currentPrice - liquidationPrice) / currentPrice < 0.1) {
        alert('Warning: Position approaching liquidation price!')
      }
    }
  }, [position, currentPrice])

  if (!position || position.size === 0) return null

  return (
    <div className="mt-4 p-4 bg-red-900/20 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Liquidation Monitor</h3>
      <p>Current Price: ${currentPrice}</p>
      <p>Entry Price: ${formatEther(position.entryPrice)}</p>
      <p>Liquidation Price: ${calculateLiquidationPrice()}</p>
    </div>
  )
}

export default LiquidationMonitor;
