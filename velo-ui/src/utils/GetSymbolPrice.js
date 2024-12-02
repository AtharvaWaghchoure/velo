// import BigNumber from "bignumber.js";

// const PythID = {
//   BTCUSD: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
//   ETHUSD: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
//   SOLUSD: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
// };

// export const getSymbolPrice = async (symbol) => {
//   try {
//     const pythID = PythID[symbol];

//     if (!pythID) {
//       throw new Error(`Invalid symbol: ${symbol}`);
//     }

//     const res = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=${pythID}`);
//     const data = await res.json();

//     const priceRaw = data.parsed[0].price.price;
//     const expo = data.parsed[0].price.expo;

//     const price = new BigNumber(priceRaw);
//     let finalPrice;

//     if (expo >= 0) {
//       finalPrice = price.multipliedBy(new BigNumber(10).pow(expo));
//     } else {
//       finalPrice = price.dividedBy(new BigNumber(10).pow(-expo));
//     }

//     const finalPriceString = finalPrice.toFixed();

//     return parseFloat(finalPriceString);
//   } catch (error) {
//     console.error(`Error fetching price for symbol ${symbol}:`, error);
//     throw error;
//   }
// };


// import BigNumber from "bignumber.js";

// const PythID = {
//   BTCUSD: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
//   ETHUSD: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
//   SOLUSD: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
// };

// export const getSymbolPrice = async (symbol) => {
//   try {
//     const pythID = PythID[symbol];

//     if (!pythID) {
//       throw new Error(`Invalid symbol: ${symbol}`);
//     }

//     const res = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=${pythID}`);
//     const data = await res.json();

//     const priceRaw = data.parsed[0].price.price;
//     const expo = data.parsed[0].price.expo;

//     const price = new BigNumber(priceRaw);
//     let finalPrice;

//     if (expo >= 0) {
//       finalPrice = price.multipliedBy(new BigNumber(10).pow(expo));
//     } else {
//       finalPrice = price.dividedBy(new BigNumber(10).pow(-expo));
//     }

//     const finalPriceString = finalPrice.toFixed();

//     return parseFloat(finalPriceString);
//   } catch (error) {
//     console.error(`Error fetching price for symbol ${symbol}:`, error);
//     throw error;
//   }
// };
import BigNumber from "bignumber.js";

const PythID = {
  BASEUSD: "0x7d17b9fe4ea7103be16b6836984fabbc889a9f9ea5df7a5bc52f0b6857879dba",
  BTCUSD: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  ETHUSD: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  SOLUSD: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
};

export const getSymbolPrice = async (symbol) => {
  try {
    const pythID = PythID[symbol];

    if (!pythID) {
      throw new Error(`Invalid symbol: ${symbol}`);
    }

    const res = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=${pythID}`);
    const data = await res.json();

    const priceRaw = data.parsed[0].price.price;
    const expo = data.parsed[0].price.expo;

    const price = new BigNumber(priceRaw);
    let finalPrice;

    if (expo >= 0) {
      finalPrice = price.multipliedBy(new BigNumber(10).pow(expo));
    } else {
      finalPrice = price.dividedBy(new BigNumber(10).pow(-expo));
    }

    const finalPriceString = finalPrice.toFixed();

    return parseFloat(finalPriceString);
  } catch (error) {
    console.error(`Error fetching price for symbol ${symbol}:`, error);
    // Return fallback prices for development
    const fallbackPrices = {
      BASEUSD: 0.65,
      BTCUSD: 42000,
      ETHUSD: 2200,
      SOLUSD: 60
    };
    return fallbackPrices[symbol] || 0;
  }
};