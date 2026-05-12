🚀 Trading Verse Backend | AI-Powered Trading Engine

This is the core backend engine for the Trading Verse platform. It manages real-time portfolio tracking, AI-driven stock analysis, and a high-performance leaderboard using a hybrid SQL + NoSQL architecture.

🏗️ Technical StackFramework: Flask (Python 3.10+)Primary Database: PostgreSQL (User data, Transactions, Holdings)Caching/Leaderboard: Redis (Real-time rankings & session management)AI Engine: Google Gemini Pro (google-genai)Containerization: Docker & Docker ComposeAuthentication: JWT (JSON Web Tokens)

📂 Project Structure & Blueprints

The backend uses a Modular Blueprint Architecture for scalability:
auth_bp: Handles user registration, login, and JWT token issuance.trading_bp: Manages buy/sell logic, portfolio valuation, and transaction history.market_bp: Fetches real-time stock data and manages the Redis Leaderboard.ai_bp: Interface for Gemini AI stock sentiment and technical analysis.

🛠️ Key Functions & Logic

1. The Trading Engine (trading_bp)execute_trade(): Validates buying power, calculates weighted average cost for holdings, and updates PostgreSQL tables within a single transaction.get_portfolio(): Uses Common Table Expressions (CTEs) to join user holdings with live market prices to calculate unrealized P/L.

2. Live Leaderboard (market_bp + Redis)update_leaderboard(username, profit): Uses Redis Sorted Sets (ZADD) to store user rankings.get_top_traders(): Retrieves the top 10 rankings instantly using ZREVRANGE.

3. AI Analysis (ai_bp)analyze_stock(ticker): Aggregates recent price movement and feeds it into Gemini Pro to generate a technical summary and risk-to-reward ratio.

🚦 Getting Started (Docker)

Since this project requires a specific environment (Redis/Postgres), it is designed to run via Docker.

1. Environment SetupCreate a .env file in the root:Code snippetFLASK_APP=app.py

2. CommandsTaskCommandStart everythingdocker-compose up --buildStop servicesdocker-compose downView logsdocker-logs -f flask_backendDatabase Migrationsdocker-compose exec backend flask db upgrade

📚 Core Libraries & Dependenciesflask: 

Core web framework.
flask-sqlalchemy: ORM for PostgreSQL interaction.
flask-jwt-extended: Secure token-based 
authentication.redis: High-speed data structures for the leaderboard.
google-genai: Integration with Gemini AI models.
pandas & numpy: Data manipulation for financial calculations.
yfinance: Fetching real-time market data.

🧪 API EndpointsMethodEndpointDescription


POST/auth/registerCreate a new account
GET/trading/portfolio
Get holdings and balance
POST/trading/tradeExecute a buy/sell order
GET/market/leaderboardFetch top 10 performers from RedisPOST/ai/analyzeGet AI stock recommendations

🔮 Future Scope


1. WebSocket IntegrationCurrently, the frontend polls every 30 seconds. Implementing WebSockets (Socket.io) will allow the backend to "push" price updates and leaderboard changes instantly.
2. Advanced AI AgentsMoving from basic analysis to Autonomous Agents that can perform "Paper Trading" strategies on behalf of the user based on natural language prompts.
3. Distributed CachingImplementing Redis Pub/Sub for multi-instance scaling, ensuring the leaderboard remains synchronized across multiple backend containers.
4. Predictive AnalyticsIntegrating Scikit-learn or TensorFlow models to provide price prediction overlays on the Recharts frontend.