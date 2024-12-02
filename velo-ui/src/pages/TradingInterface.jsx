import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TradingViewWidget from '../components/TradingViewWidget';
import { getSymbolPrice } from '../utils/GetSymbolPrice';
import { useAccount } from 'wagmi';

const symbolMap = {
  'BASEUSD': 'COINBASE:BASE-USD',
  'BTCUSD': 'BINANCE:BTCUSDT',
  'ETHUSD': 'BINANCE:ETHUSDT',
  'SOLUSD': 'BINANCE:SOLUSDT'
};

const AVAILABLE_PAIRS = [
  { symbol: 'BASEUSD', name: 'BASE' },
  { symbol: 'BTCUSD', name: 'Bitcoin' },
  { symbol: 'ETHUSD', name: 'Ethereum' },
  { symbol: 'SOLUSD', name: 'Solana' }
];

const TradingInterface = () => {
  const { address, isConnected } = useAccount();
  const [selectedPair, setSelectedPair] = useState('BASEUSD');
  const [price, setPrice] = useState(0);
  const [tradeType, setTradeType] = useState('long');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState('1');

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const newPrice = await getSymbolPrice(selectedPair);
        setPrice(newPrice);
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 1000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  const handleTrade = () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    console.log(`Executing ${tradeType} trade for ${amount} ${selectedPair} with ${leverage}x leverage`);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto pt-20 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            {AVAILABLE_PAIRS.map(pair => (
              <button
                key={pair.symbol}
                onClick={() => setSelectedPair(pair.symbol)}
                className={`px-4 py-2 rounded-lg ${
                  selectedPair === pair.symbol ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {pair.name}
              </button>
            ))}
          </div>
          <ConnectButton />
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3">
            <div className="bg-black rounded-lg overflow-hidden h-[calc(100vh-180px)]">
              <TradingViewWidget symbol={symbolMap[selectedPair]} key={selectedPair} />
            </div>
          </div>

          <div className="col-span-1 space-y-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-2">{selectedPair.replace('USD', '/USD')}</h2>
              <p className="text-2xl">${price.toFixed(2)}</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setTradeType('long')}
                  className={`flex-1 py-3 rounded font-semibold ${
                    tradeType === 'long' ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                >
                  Long
                </button>
                <button
                  onClick={() => setTradeType('short')}
                  className={`flex-1 py-3 rounded font-semibold ${
                    tradeType === 'short' ? 'bg-red-600' : 'bg-gray-700'
                  }`}
                >
                  Short
                </button>
              </div>

              <div>
                <label className="block mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 bg-gray-800 rounded"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block mb-2">Leverage</label>
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  className="w-full p-3 bg-gray-800 rounded"
                >
                  {[1, 2, 5, 10, 20, 50, 100].map(x => (
                    <option key={x} value={x}>{x}x</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleTrade}
                disabled={!isConnected}
                className={`w-full py-4 rounded font-bold text-lg ${
                  !isConnected 
                    ? 'bg-gray-600 cursor-not-allowed'
                    : tradeType === 'long'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {!isConnected 
                  ? 'Connect Wallet to Trade' 
                  : `${tradeType === 'long' ? 'Long' : 'Short'} ${selectedPair.replace('USD', '')}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;