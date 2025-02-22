import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./App.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Portfolio from "./components/Portfolio/Portfolio";
import Tabs from "./components/Tabs/Tabs";
import Chart from "react-apexcharts";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [shares, setShares] = useState("");
  const [refreshPortfolio, setRefreshPortfolio] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const [maxShares, setMaxShares] = useState(null);
  const [chartType, setChartType] = useState("line");

  const stockCategories = useMemo(() => {
    const categories = {
      "ALL STOCKS": [],
      METAL: [
        { symbol: "TATASTEEL", name: "Tata Steel" },
        { symbol: "HINDALCO", name: "Hindalco Industries" },
        { symbol: "JSWSTEEL", name: "JSW Steel" },
        { symbol: "SAIL", name: "Steel Authority of India" },
        { symbol: "NATIONALUM", name: "National Aluminium" },
        { symbol: "HINDCOPPER", name: "Hindustan Copper" },
      ],
      IT: [
        { symbol: "TCS", name: "Tata Consultancy Services" },
        { symbol: "INFY", name: "Infosys" },
        { symbol: "WIPRO", name: "Wipro" },
        { symbol: "TECHM", name: "Tech Mahindra" },
        { symbol: "HCLTECH", name: "HCL Technologies" },
        { symbol: "MINDTREE", name: "Mindtree" },
      ],
      BANKING: [
        { symbol: "HDFCBANK", name: "HDFC Bank" },
        { symbol: "SBIN", name: "State Bank of India" },
        { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank" },
        { symbol: "AXISBANK", name: "Axis Bank" },
        { symbol: "ICICIBANK", name: "ICICI Bank" },
        { symbol: "BANKBARODA", name: "Bank of Baroda" },
      ],
      AUTO: [
        { symbol: "TATAMOTORS", name: "Tata Motors" },
        { symbol: "MARUTI", name: "Maruti Suzuki" },
        { symbol: "M&M", name: "Mahindra & Mahindra" },
        { symbol: "EICHERMOT", name: "Eicher Motors" },
        { symbol: "HEROMOTOCO", name: "Hero MotoCorp" },
        { symbol: "BAJAJ-AUTO", name: "Bajaj Auto" },
      ],
      PHARMA: [
        { symbol: "SUNPHARMA", name: "Sun Pharmaceutical" },
        { symbol: "CIPLA", name: "Cipla" },
        { symbol: "DIVISLAB", name: "Divi's Laboratories" },
        { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories" },
        { symbol: "BIOCON", name: "Biocon" },
        { symbol: "TORNTPHARM", name: "Torrent Pharmaceuticals" },
      ],
      FMCG: [
        { symbol: "HINDUNILVR", name: "Hindustan Unilever" },
        { symbol: "ITC", name: "ITC" },
        { symbol: "NESTLEIND", name: "Nestle India" },
        { symbol: "BRITANNIA", name: "Britannia Industries" },
        { symbol: "DABUR", name: "Dabur India" },
        { symbol: "MARICO", name: "Marico" },
      ],
      ENERGY: [
        { symbol: "RELIANCE", name: "Reliance Industries" },
        { symbol: "POWERGRID", name: "Power Grid Corporation" },
        { symbol: "NTPC", name: "NTPC" },
        { symbol: "ONGC", name: "Oil & Natural Gas Corporation" },
        { symbol: "TATAPOWER", name: "Tata Power" },
        { symbol: "ADANIGREEN", name: "Adani Green Energy" },
      ],
      SUGAR: [
        { symbol: "BALRAMCHIN", name: "Balrampur Chini Mills" },
        { symbol: "DHAMPUR", name: "Dhampur Sugar Mills" },
        { symbol: "RENUKA", name: "Shree Renuka Sugars" },
        { symbol: "EIDPARRY", name: "EID Parry" },
        { symbol: "TRIVENI", name: "Triveni Engineering" },
        { symbol: "DCMSHRIRAM", name: "DCM Shriram" },
      ],
    };

    categories["ALL STOCKS"] = Object.entries(categories)
      .filter(([key]) => key !== "ALL STOCKS")
      .flatMap(([_, stocks]) => stocks)
      .sort((a, b) => a.name.localeCompare(b.name));

    return categories;
  }, []);

  useEffect(() => {
    if (selectedCategory && !selectedStock) {
      setSelectedStock(stockCategories[selectedCategory][0].symbol);
    }
  }, [selectedCategory, selectedStock, stockCategories]);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/verify",
          {
            withCredentials: true,
          }
        );
        if (response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    checkLoggedIn();
  }, []);

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setSelectedCategory(newCategory);
    const firstStock = stockCategories[newCategory][0].symbol;
    setSelectedStock(firstStock);

    if (activeTab === "trade") {
      // Fetch price for the first stock in the new category
      handleStockChange({ target: { value: firstStock } });
    }
  };

  const handleStockChange = async (event) => {
    const newStock = event.target.value;
    setSelectedStock(newStock);
    setStockData(null);

    if (activeTab === "trade") {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/stock-data/${newStock}`,
          {
            withCredentials: true,
          }
        );
        setStockData(response.data);
      } catch (err) {
        setError("Failed to fetch stock price");
      }
    }
  };

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/stock-data/${selectedStock}`,
        {
          withCredentials: true,
        }
      );
      setStockData(response.data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError(error.response?.data?.error || "Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/api/auth/logout", {
        withCredentials: true,
      });
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const fetchPortfolio = async () => {
    try {
      await axios.get("http://localhost:5000/api/portfolio", {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const executeTrade = async (type, symbol, shares) => {
    try {
      const priceResponse = await axios.get(
        `http://localhost:5000/api/stock-data/${symbol}`,
        {
          withCredentials: true,
        }
      );
      const price = priceResponse.data.price;

      await axios.post(
        `http://localhost:5000/api/portfolio/${type}`,
        {
          symbol,
          shares: Number(shares),
          price: Number(price),
        },
        { withCredentials: true }
      );

      setRefreshPortfolio((prev) => prev + 1);
      setShares("");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${type} shares`);
    }
  };

  const calculateMaxShares = async () => {
    try {
      const priceResponse = await axios.get(
        `http://localhost:5000/api/stock-data/${selectedStock}`,
        {
          withCredentials: true,
        }
      );
      const price = priceResponse.data.price;

      const portfolioResponse = await axios.get(
        "http://localhost:5000/api/portfolio",
        {
          withCredentials: true,
        }
      );
      const balance = portfolioResponse.data.balance;

      const maxPossibleShares = Math.floor(balance / price);
      setMaxShares(maxPossibleShares);
      setShares(maxPossibleShares.toString());
      setStockData(priceResponse.data);
      setError(null);
    } catch (err) {
      setError("Failed to calculate maximum shares");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            {renderStockSelector()}

            <button onClick={handleClick} disabled={loading}>
              {loading ? "Loading..." : `Get ${selectedStock} Stock Data`}
            </button>

            {error && <p className="error">{error}</p>}

            {stockData && (
              <>
                <div className="stock-data">
                  <h2>{stockData.symbol}</h2>
                  <p>Price: ₹{parseFloat(stockData.price).toFixed(2)}</p>
                  <p
                    className={
                      parseFloat(stockData.change) >= 0
                        ? "positive"
                        : "negative"
                    }
                  >
                    Change: ₹{parseFloat(stockData.change).toFixed(2)}(
                    {stockData.changePercent})
                  </p>
                </div>

                {stockData.historical && stockData.historical.length > 0 && (
                  <div className="chart-container">
                    <div className="chart-controls">
                      <button
                        className={`chart-toggle ${
                          chartType === "line" ? "active" : ""
                        }`}
                        onClick={() => setChartType("line")}
                      >
                        Line Chart
                      </button>
                      <button
                        className={`chart-toggle ${
                          chartType === "candlestick" ? "active" : ""
                        }`}
                        onClick={() => setChartType("candlestick")}
                      >
                        Candlestick Chart
                      </button>
                    </div>
                    <Chart
                      options={{
                        chart: {
                          type: chartType === "line" ? "line" : "candlestick",
                          height: 350,
                          background: "#1a1f27",
                          foreColor: "#fff",
                        },
                        title: {
                          text: `${stockData.symbol} Price Chart`,
                          align: "center",
                          style: { color: "#fff" },
                        },
                        xaxis: {
                          type: "datetime",
                          labels: { style: { colors: "#fff" } },
                        },
                        yaxis: {
                          tooltip: { enabled: true },
                          labels: { style: { colors: "#fff" } },
                        },
                      }}
                      series={[
                        {
                          data: stockData.historical.map((item) => ({
                            x: new Date(item.date).getTime(),
                            y:
                              chartType === "line"
                                ? [parseFloat(item.price)]
                                : [
                                    parseFloat(item.price),
                                    parseFloat(item.price) * 1.02,
                                    parseFloat(item.price) * 0.98,
                                    parseFloat(item.price) *
                                      (1 + (Math.random() * 0.04 - 0.02)),
                                  ],
                          })),
                        },
                      ]}
                      type={chartType === "line" ? "line" : "candlestick"}
                      height={350}
                    />
                  </div>
                )}
              </>
            )}
          </>
        );

      case "trade":
        return (
          <>
            {renderStockSelector()}

            {stockData && (
              <div className="current-price">
                Current Price: ₹{parseFloat(stockData.price).toFixed(2)}
              </div>
            )}

            <div className="trading-controls">
              <button className="calc-max-btn" onClick={calculateMaxShares}>
                Calculate Max Shares
              </button>
              {maxShares !== null && (
                <p className="max-shares">
                  Maximum shares you can buy: {maxShares}
                </p>
              )}
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="Number of shares"
                min="1"
                max={maxShares || undefined}
              />
              <button
                onClick={() => executeTrade("buy", selectedStock, shares)}
              >
                Buy
              </button>
              <button
                onClick={() => executeTrade("sell", selectedStock, shares)}
              >
                Sell
              </button>
            </div>
            {error && <p className="error">{error}</p>}
          </>
        );

      case "portfolio":
        return <Portfolio refreshTrigger={refreshPortfolio} />;

      default:
        return null;
    }
  };

  const renderStockSelector = () => (
    <div className="stock-selector">
      <div className="selector-group">
        <label>Select Category:</label>
        <select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">Select a Category</option>
          {Object.keys(stockCategories).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div className="selector-group">
          <label>Select Stock:</label>
          <select value={selectedStock} onChange={handleStockChange}>
            <option value="">Select a Stock</option>
            {stockCategories[selectedCategory].map((stock) => (
              <option key={stock.symbol} value={stock.symbol}>
                {stock.name} ({stock.symbol})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Stock Market Data</h1>
          {showLogin ? (
            <>
              <Login onLogin={handleLogin} />
              <p>
                Don't have an account?{" "}
                <button onClick={() => setShowLogin(false)}>Sign Up</button>
              </p>
            </>
          ) : (
            <>
              <Signup onSignup={handleLogin} />
              <p>
                Already have an account?{" "}
                <button onClick={() => setShowLogin(true)}>Login</button>
              </p>
            </>
          )}
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-controls">
          <h1>Indian Stock Market Data</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {renderContent()}
      </header>
    </div>
  );
}

export default App;
