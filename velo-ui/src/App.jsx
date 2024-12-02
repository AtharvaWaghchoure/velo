import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TradingInterface from "./pages/TradingInterface";
import TradeHistory from "./pages/TradeHistory";
import Navbar from "./components/Navbar";

const config = getDefaultConfig({
  appName: "velo",
  projectId: "c4952f813801ed9eca12cf9e24a94ac6",
  chains: [baseSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

const App = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-black text-white">
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/trade" element={<TradingInterface />} />
                <Route path="/history" element={<TradeHistory />} />
              </Routes>
            </div>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;