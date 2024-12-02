import { useState, useEffect } from 'react';

const mockTrades = [
  {
    id: 1,
    timestamp: '2024-02-15 14:30',
    pair: 'BTCUSD',
    type: 'Long',
    amount: 1000,
    leverage: '10x',
    entryPrice: 42000.50,
    exitPrice: 45000.75,
    pnl: 71.43,
    status: 'Closed'
  },
  {
    id: 2,
    timestamp: '2024-02-14 09:15',
    pair: 'ETHUSD',
    type: 'Short',
    amount: 500,
    leverage: '5x',
    entryPrice: 2800.25,
    exitPrice: 2600.50,
    pnl: -35.71,
    status: 'Closed'
  },
  {
    id: 3,
    timestamp: '2024-02-13 16:45',
    pair: 'BASEUSD',
    type: 'Long',
    amount: 2000,
    leverage: '20x',
    entryPrice: 0.65,
    exitPrice: 0.72,
    pnl: 215.38,
    status: 'Closed'
  }
];

const TradeHistory = () => {
  const [trades, setTrades] = useState(mockTrades);
  const [loading, setLoading] = useState(false);

  return (
    <div className="container mx-auto pt-24 px-4 pb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Trade History</h1>
        <div className="text-sm text-gray-400">
          Showing {trades.length} trades
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Pair</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Size</th>
              <th className="p-4 text-left">Leverage</th>
              <th className="p-4 text-left">Entry Price</th>
              <th className="p-4 text-left">Exit Price</th>
              <th className="p-4 text-left">PnL %</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr 
                key={trade.id} 
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
              >
                <td className="p-4">{trade.timestamp}</td>
                <td className="p-4 font-medium">{trade.pair}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    trade.type === 'Long' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {trade.type}
                  </span>
                </td>
                <td className="p-4">${trade.amount.toLocaleString()}</td>
                <td className="p-4">{trade.leverage}</td>
                <td className="p-4">${trade.entryPrice.toLocaleString(undefined, { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</td>
                <td className="p-4">${trade.exitPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</td>
                <td className={`p-4 font-medium ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}%
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    trade.status === 'Open' 
                      ? 'bg-blue-500/20 text-blue-500' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {trade.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {trades.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No trades found
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;