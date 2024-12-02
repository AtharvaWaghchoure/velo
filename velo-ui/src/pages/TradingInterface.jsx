import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TradingViewWidget from '../components/TradingViewWidget';
import { getSymbolPrice } from '../utils/GetSymbolPrice';
import { useAccount } from 'wagmi';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade animation to complete
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300
      ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      ${type === 'long' ? 'bg-green-600' : 'bg-red-600'} 
      text-white p-4 rounded-lg shadow-lg max-w-md`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm font-medium">Order Placed Successfully!</p>
            <p className="text-sm opacity-90 mt-1">{message}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-4 text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Rest of your TradingInterface component remains the same
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
  const [toast, setToast] = useState(null);

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

    const message = `${tradeType.toUpperCase()} ${amount} USD of ${selectedPair.replace('USD', '')} at ${leverage}x leverage`;
    setToast({ message, type: tradeType });
    
    console.log(`Executing ${tradeType} trade for ${amount} ${selectedPair} with ${leverage}x leverage`);
  };

  return (
    <div className="min-h-screen bg-black">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
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