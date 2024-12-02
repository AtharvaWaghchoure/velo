// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title FuturesPerpetualTrading
 * @dev Implements a futures and perpetual trading system with leverage
 * Features:
 * - Opening long/short positions
 * - Leverage trading
 * - Liquidation mechanism
 * - Funding rate adjustments
 * - Position management
 */
contract FuturesPerpetualTrading is ReentrancyGuardUpgradeable, Ownable {
    // Structs to represent positions and orders
    struct Position {
        uint256 size;          // Position size in base currency
        uint256 margin;        // Collateral amount
        uint256 entryPrice;    // Entry price of the position
        bool isLong;          // True for long, false for short
        uint256 leverage;      // Position leverage
        uint256 lastFundingPayment; // Timestamp of last funding payment
    }

    // State variables
    mapping(address => Position) public positions;
    mapping(address => uint256) public balances;
    
    uint256 public minMargin = 50 ether;        // Minimum margin requirement
    uint256 public liquidationThreshold = 80;    // Liquidation threshold (80%)
    uint256 public fundingRate = 0.01 ether;    // Hourly funding rate (1%)
    uint256 public maxLeverage = 100;           // Maximum allowed leverage
    
    IERC20 public collateralToken;              // Token used for margin
    
    // Events for tracking important contract actions
    event PositionOpened(address indexed trader, uint256 size, bool isLong, uint256 leverage);
    event PositionClosed(address indexed trader, uint256 pnl);
    event PositionLiquidated(address indexed trader, uint256 size);
    event MarginAdded(address indexed trader, uint256 amount);
    event MarginRemoved(address indexed trader, uint256 amount);

    /**
     * @dev Constructor initializes the contract with collateral token and sets deployer as owner
     * @param _collateralToken Address of the ERC20 token used for collateral
     */
    constructor(
        address _collateralToken
    ) Ownable(msg.sender) {  // Initialize Ownable with deployer as owner
        collateralToken = IERC20(_collateralToken);
    }


    /**
     * @dev Opens a new futures position
     * @param size Position size in base currency
     * @param isLong Direction of the position
     * @param leverage Amount of leverage used
     * @param price Current market price
     */
    function openPosition(
        uint256 size,
        bool isLong,
        uint256 leverage,
        uint256 price
    ) external nonReentrant {
        require(leverage <= maxLeverage, "Leverage exceeds maximum");
        require(positions[msg.sender].size == 0, "Position already exists");
        
        uint256 requiredMargin = (size * price) / leverage;
        require(requiredMargin >= minMargin, "Margin too low");
        
        // Transfer collateral from user
        require(collateralToken.transferFrom(msg.sender, address(this), requiredMargin), "Transfer failed");
        
        // Create new position
        positions[msg.sender] = Position({
            size: size,
            margin: requiredMargin,
            entryPrice: price,
            isLong: isLong,
            leverage: leverage,
            lastFundingPayment: block.timestamp
        });
        
        emit PositionOpened(msg.sender, size, isLong, leverage);
    }

    /**
     * @dev Closes an existing position
     * @param price Current market price
     */
    function closePosition(uint256 price) external nonReentrant {
        Position memory position = positions[msg.sender];
        require(position.size > 0, "No position exists");
        
        // Calculate PnL
        int256 pnl = calculatePnL(position, price);
        uint256 fundingFee = calculateFundingFee(position);
        
        // Calculate total return
        uint256 totalReturn;
        if (pnl > 0) {
            totalReturn = position.margin + uint256(pnl) - fundingFee;
        } else {
            totalReturn = position.margin - uint256(-pnl) - fundingFee;
        }
        
        // Transfer funds back to user
        require(collateralToken.transfer(msg.sender, totalReturn), "Transfer failed");
        
        // Clear position
        delete positions[msg.sender];
        
        emit PositionClosed(msg.sender, totalReturn);
    }

    /**
     * @dev Liquidates an underwater position
     * @param trader Address of the position to liquidate
     * @param price Current market price
     */
    function liquidatePosition(address trader, uint256 price) external nonReentrant {
        Position memory position = positions[trader];
        require(position.size > 0, "No position exists");
        
        // Check if position is liquidatable
        require(isLiquidatable(position, price), "Position not liquidatable");
        
        // Calculate remaining equity
        int256 pnl = calculatePnL(position, price);
        uint256 fundingFee = calculateFundingFee(position);
        
        uint256 remainingEquity;
        if (pnl > 0) {
            remainingEquity = position.margin + uint256(pnl) - fundingFee;
        } else {
            remainingEquity = position.margin - uint256(-pnl) - fundingFee;
        }
        
        // Transfer remaining equity to insurance fund (could be modified for different mechanics)
        if (remainingEquity > 0) {
            balances[owner()] += remainingEquity;
        }
        
        // Clear position
        delete positions[trader];
        
        emit PositionLiquidated(trader, position.size);
    }

    /**
     * @dev Calculates unrealized PnL for a position
     * @param position Position to calculate PnL for
     * @param currentPrice Current market price
     */
    function calculatePnL(Position memory position, uint256 currentPrice) internal pure returns (int256) {
        if (position.isLong) {
            return int256(((currentPrice - position.entryPrice) * position.size) / position.entryPrice);
        } else {
            return int256(((position.entryPrice - currentPrice) * position.size) / position.entryPrice);
        }
    }

    /**
     * @dev Calculates funding fee for a position
     * @param position Position to calculate funding fee for
     */
    function calculateFundingFee(Position memory position) internal view returns (uint256) {
        uint256 hoursElapsed = (block.timestamp - position.lastFundingPayment) / 3600;
        return (position.size * fundingRate * hoursElapsed) / 1 ether;
    }

    /**
     * @dev Checks if a position should be liquidated
     * @param position Position to check
     * @param currentPrice Current market price
     */
    function isLiquidatable(Position memory position, uint256 currentPrice) internal view returns (bool) {
        int256 pnl = calculatePnL(position, currentPrice);
        if (pnl < 0) {
            uint256 loss = uint256(-pnl);
            return loss >= (position.margin * liquidationThreshold) / 100;
        }
        return false;
    }

    /**
     * @dev Adds margin to an existing position
     * @param amount Amount of margin to add
     */
    function addMargin(uint256 amount) external nonReentrant {
        require(positions[msg.sender].size > 0, "No position exists");
        require(collateralToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        positions[msg.sender].margin += amount;
        
        emit MarginAdded(msg.sender, amount);
    }

    /**
     * @dev Removes excess margin from a position
     * @param amount Amount of margin to remove
     * @param price Current market price
     */
    function removeMargin(uint256 amount, uint256 price) external nonReentrant {
        Position storage position = positions[msg.sender];
        require(position.size > 0, "No position exists");
        
        // Calculate required margin after removal
        uint256 requiredMargin = (position.size * price) / position.leverage;
        require(position.margin - amount >= requiredMargin, "Insufficient margin after removal");
        
        // Transfer margin back to user
        require(collateralToken.transfer(msg.sender, amount), "Transfer failed");
        
        position.margin -= amount;
        
        emit MarginRemoved(msg.sender, amount);
    }

    // Admin functions for contract management
    function setMinMargin(uint256 _minMargin) external onlyOwner {
        minMargin = _minMargin;
    }
    
    function setLiquidationThreshold(uint256 _threshold) external onlyOwner {
        require(_threshold > 0 && _threshold < 100, "Invalid threshold");
        liquidationThreshold = _threshold;
    }
    
    function setFundingRate(uint256 _fundingRate) external onlyOwner {
        fundingRate = _fundingRate;
    }
    
    function setMaxLeverage(uint256 _maxLeverage) external onlyOwner {
        maxLeverage = _maxLeverage;
    }
}
