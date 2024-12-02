// hooks/useContract.js
import { useContractRead, useContractWrite, useAccount } from 'wagmi';
import { parseEther } from 'viem';

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";
const CONTRACT_ABI = [
  // Basic trading functions
  "function openPosition(uint256 size, bool isLong, uint256 leverage, uint256 price) external",
  "function closePosition(uint256 price) external",
  "function addMargin(uint256 amount) external",
  "function removeMargin(uint256 amount, uint256 price) external",
  
  // View functions
  "function positions(address) external view returns (uint256 size, uint256 margin, uint256 entryPrice, bool isLong, uint256 leverage, uint256 lastFundingPayment)",
  "function minMargin() external view returns (uint256)",
  "function maxLeverage() external view returns (uint256)",
  "function liquidationThreshold() external view returns (uint256)",
  
  // Events
  "event PositionOpened(address indexed trader, uint256 size, bool isLong, uint256 leverage)",
  "event PositionClosed(address indexed trader, uint256 pnl)",
  "event PositionLiquidated(address indexed trader, uint256 size)",
  "event MarginAdded(address indexed trader, uint256 amount)",
  "event MarginRemoved(address indexed trader, uint256 amount)"
];

export function useContract() {
  const { address } = useAccount();

  // Read position info
  const { data: position, refetch: refreshPosition } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'positions',
    args: [address],
    enabled: !!address,
    watch: true
  });

  // Contract write functions
  const { writeAsync: openPosition } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'openPosition',
  });

  const { writeAsync: closePosition } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'closePosition',
  });

  const { writeAsync: addMargin } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'addMargin',
  });

  const { writeAsync: removeMargin } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'removeMargin',
  });

  // Helper function for trade history
  const getAllTrades = async () => {
    // For now, return mock data
    return [
      {
        id: '1',
        symbol: 'BTCUSD',
        isLong: true,
        size: parseEther('1000'),
        leverage: '10',
        entryPrice: parseEther('42000'),
        exitPrice: parseEther('45000'),
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        isOpen: false
      },
      {
        id: '2',
        symbol: 'ETHUSD',
        isLong: false,
        size: parseEther('500'),
        leverage: '5',
        entryPrice: parseEther('2800'),
        exitPrice: parseEther('2600'),
        timestamp: Math.floor(Date.now() / 1000) - 172800,
        isOpen: false
      }
    ];
  };

  return {
    position,
    refreshPosition,
    openPosition,
    closePosition,
    addMargin,
    removeMargin,
    getAllTrades
  };
}