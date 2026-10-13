# 🌱 AgriPulse AI — Agricultural Market Intelligence

AgriPulse AI is an AI-powered agricultural market intelligence platform designed to help farmers and market stakeholders understand price volatility in agricultural commodities. It combines historical market prices, mandi arrivals, rainfall patterns, and seasonal indicators to provide data-driven insights into changing market conditions.

The current implementation focuses on **Tur Dal (Pigeon Pea) at Mumbai APMC**, with a 14-day price volatility forecast, risk classification, and interactive market insights.

## ✨ Features

- **14-Day Volatility Forecast:** Estimates upcoming Tur Dal price volatility to help users understand potential market fluctuations.
- **AI/ML-Powered Prediction:** Integrates a trained machine learning model with market and weather-related features.
- **Risk Classification:** Categorizes estimated volatility into risk levels to make predictions easier to interpret.
- **Scenario Simulator:** Allows users to adjust market price, mandi arrivals, rainfall, and monsoon deficit inputs to explore different market conditions.
- **Maharashtra Market Map:** Provides an interactive view of agricultural market information.
- **Market Trends:** Explore price movements, mandi arrivals, and historical patterns.
- **Rainfall Insights:** Examine rainfall and monsoon-deficit information in the context of agricultural markets.
- **Historical Data:** Access historical market data and available filters.
- **Interactive Dashboard:** Presents key metrics and market insights in a consolidated interface.

## 🧠 Machine Learning Approach

The prediction workflow uses historical agricultural market data and engineered features to estimate price volatility.

### Data and Features

The model development workflow uses historical information from 2021–2024, including:

- Historical market prices
- Mandi arrivals
- Rainfall information
- Price lags and recent volatility
- Seasonal and monsoon-related indicators

### Model Development

Multiple regression models were evaluated during development, including:

- Linear Regression
- Random Forest
- XGBoost
- CatBoost

CatBoost was selected for the implemented model based on the development evaluation, particularly its Mean Absolute Error (MAE). Model performance varies across evaluation metrics, and the results have limitations that should be considered when interpreting forecasts.

**Important:** The forecast is an estimate of volatility, not a guaranteed future market price. Its reliability depends on the quality and availability of relevant input data.

## 🛠️ Technology Stack

Update this section to match the technologies and dependencies actually used in your repository.

- **Frontend:** Web-based interactive dashboard
- **Programming Language:** Python for machine learning; other languages as used by the application
- **Machine Learning:** CatBoost, with other models used during evaluation
- **Data Processing:** Historical market, mandi-arrival, and rainfall data
- **Visualization:** Interactive charts and market insights

## 🚀 Getting Started

### Prerequisites

Install the tools required by the technologies in your project. Depending on your implementation, these may include Python, Node.js, and npm.

### Installation

1. Clone the repository:

   ```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   ```

2. Navigate to the project directory:

   ```bash
   cd <YOUR_PROJECT_FOLDER>
   ```

3. Install dependencies using the package manager and dependency files provided in the repository.

4. Configure any required environment variables using the project's environment-variable documentation. Do not commit API keys, credentials, or private configuration files.

5. Start the application using the development commands defined in your project configuration.

Refer to the actual project files for the exact installation and startup commands.

## 📊 Current Scope and Limitations

- The primary forecasting implementation focuses on Tur Dal at Mumbai APMC.
- Historical model-development data covers 2021–2024.
- Displaying a forecast for a future date does not mean that real market observations are available for that date.
- Forecast quality depends on the accuracy and relevance of the input features.
- Risk categories are indicators of estimated volatility, not financial or trading advice.

## 🔮 Future Enhancements

- Expand support to additional agricultural commodities and markets.
- Integrate reliable, updated market and weather data sources.
- Improve model evaluation and forecast reliability.
- Add regional and seasonal comparisons.
- Provide multilingual insights for broader accessibility.

## 🎯 Project Objective

AgriPulse AI aims to make agricultural market information easier to understand and use by translating historical market and weather patterns into accessible volatility forecasts and risk insights.

## 👩‍💻 Author

**Heenal Kacha**

- GitHub: [HeenalKacha](https://github.com/HeenalKacha)
- LinkedIn: [Heenal Kacha](https://linkedin.com/in/heenal-kacha-39528132b)

---

*AgriPulse AI — Turning agricultural data into actionable market insights.*
