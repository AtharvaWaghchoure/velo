// import { memo, useEffect, useRef } from "react";

// function TradingViewWidget({ symbol }) {
//   const container = useRef(null);
//   const scriptLoaded = useRef(false);

//   useEffect(() => {
//     if (scriptLoaded.current) return;

//     const script = document.createElement("script");
//     script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
//     script.type = "text/javascript";
//     script.async = true;
//     script.innerHTML = `
//       {
//           "autosize": true,
//           "width": "100%",
//           "height": "100%",
//           "symbol": "${symbol}",
//           "interval": "D",
//           "timezone": "Etc/UTC",
//           "theme": "dark",
//           "style": "3",
//           "locale": "en",
//           "backgroundColor": "rgba(20, 20, 20, 1)",
//           "hide_top_toolbar": false,
//           "withdateranges": true,
//           "allow_symbol_change": false,
//           "calendar": false,
//           "support_host": "https://www.tradingview.com"
//         }`;

//     if (container.current) {
//       container.current.appendChild(script);
//     }
//     scriptLoaded.current = true;

//     return () => {
//       if (container.current && script.parentNode === container.current) {
//         container.current.removeChild(script);
//       }
//       scriptLoaded.current = false;
//     };
//   }, [symbol]);

//   return (
//     <div className="tradingview-widget-container h-[600px]" ref={container}>
//       <div className="tradingview-widget-container__widget rounded"></div>
//       <div className="tradingview-widget-copyright"></div>
//     </div>
//   );
// }

// export default memo(TradingViewWidget);
import { memo, useEffect, useRef } from "react";

function TradingViewWidget({ symbol }) {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous chart
    container.current.innerHTML = '';

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    container.current.appendChild(widgetContainer);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
          "autosize": true,
          "symbol": "${symbol}",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "backgroundColor": "rgba(0, 0, 0, 1)",
          "gridColor": "rgba(42, 46, 57, 0.3)",
          "hide_top_toolbar": false,
          "hide_legend": false,
          "save_image": false,
          "hide_volume": false,
          "support_host": "https://www.tradingview.com"
        }`;

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container h-[600px] w-full bg-black" ref={container}></div>
  );
}

export default memo(TradingViewWidget);