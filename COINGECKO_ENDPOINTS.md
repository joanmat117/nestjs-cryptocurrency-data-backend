# CoinGecko API - Endpoints de Coins (Keyless Public API)

> **Base URL**: `https://api.coingecko.com/api/v3`

| # | Endpoint | Documentación | Breve explicación |
|---|----------|---------------|-------------------|
| 1 | `/ping` | [https://docs.coingecko.com/reference/ping](https://docs.coingecko.com/reference/ping) | Verifica el estado del servidor de la API. Útil para health checks. |
| 2 | `/simple/price` | [https://docs.coingecko.com/reference/simple-price](https://docs.coingecko.com/reference/simple-price) | Obtiene el precio actual de una o más monedas usando su ID, nombre o símbolo. |
| 3 | `/simple/token_price/{id}` | [https://docs.coingecko.com/reference/simple-token-price](https://docs.coingecko.com/reference/simple-token-price) | Obtiene el precio de tokens usando su dirección de contrato en una blockchain específica. |
| 4 | `/simple/supported_vs_currencies` | [https://docs.coingecko.com/reference/simple-supported-currencies](https://docs.coingecko.com/reference/simple-supported-currencies) | Lista todas las monedas (fiat y crypto) soportadas para usar como `vs_currencies`. |
| 5 | `/coins/list` | [https://docs.coingecko.com/reference/coins-list](https://docs.coingecko.com/reference/coins-list) | Lista todas las monedas soportadas con su ID, nombre, símbolo y (opcionalmente) dirección de contrato. |
| 6 | `/coins/markets` | [https://docs.coingecko.com/reference/coins-markets](https://docs.coingecko.com/reference/coins-markets) | Lista monedas con datos de mercado (precio, market cap, volumen, ranking, ATH, etc.). Ideal para tablas de "top criptomonedas". |
| 7 | `/coins/{id}` | [https://docs.coingecko.com/reference/coins-id](https://docs.coingecko.com/reference/coins-id) | Obtiene metadata completa de una moneda: descripción, enlaces (web, Twitter, GitHub), imágenes, datos de mercado, tickers, etc. |
| 8 | `/coins/{id}/tickers` | [https://docs.coingecko.com/reference/coins-id-tickers](https://docs.coingecko.com/reference/coins-id-tickers) | Lista los tickers (pares de trading) de una moneda en exchanges centralizados (CEX) y descentralizados (DEX). |
| 9 | `/coins/{id}/history` | [https://docs.coingecko.com/reference/coins-id-history](https://docs.coingecko.com/reference/coins-id-history) | Obtiene datos históricos (precio, market cap, volumen 24h) de una moneda en una fecha específica (YYYY-MM-DD). |
| 10 | `/coins/{id}/market_chart` | [https://docs.coingecko.com/reference/coins-id-market-chart](https://docs.coingecko.com/reference/coins-id-market-chart) | Obtiene datos históricos en serie temporal (precio, market cap, volumen) en un rango de días. |
| 11 | `/coins/{id}/market_chart/range` | [https://docs.coingecko.com/reference/coins-id-market-chart-range](https://docs.coingecko.com/reference/coins-id-market-chart-range) | Similar a `market_chart`, pero permite especificar fechas de inicio y fin personalizadas (timestamp UNIX). |
| 12 | `/coins/{id}/ohlc` | [https://docs.coingecko.com/reference/coins-id-ohlc](https://docs.coingecko.com/reference/coins-id-ohlc) | Obtiene datos OHLC (Open, High, Low, Close) para gráficos de velas. Ideal para reemplazar el endpoint de Binance. |
| 13 | `/coins/{id}/contract/{contract_address}` | [https://docs.coingecko.com/reference/coins-contract](https://docs.coingecko.com/reference/coins-contract) | Obtiene metadata de un token por dirección de contrato en una plataforma específica (imagen, webs, socials, descripción, etc.). |
| 14 | `/coins/{id}/contract/{contract_address}/market_chart` | [https://docs.coingecko.com/reference/coins-contract-market-chart](https://docs.coingecko.com/reference/coins-contract-market-chart) | Obtiene datos históricos en serie temporal de un token por dirección de contrato. |
| 15 | `/coins/{id}/contract/{contract_address}/market_chart/range` | [https://docs.coingecko.com/reference/coins-contract-market-chart-range](https://docs.coingecko.com/reference/coins-contract-market-chart-range) | Similar al anterior pero con rango de fechas personalizado. |
| 16 | `/coins/categories/list` | [https://docs.coingecko.com/reference/coins-categories-list](https://docs.coingecko.com/reference/coins-categories-list) | Lista todas las categorías de monedas disponibles en CoinGecko (ej: "layer-1", "defi", "meme-token"). |
| 17 | `/coins/categories` | [https://docs.coingecko.com/reference/coins-categories](https://docs.coingecko.com/reference/coins-categories) | Lista categorías con datos de mercado agregados (market cap total, volumen, etc.). |
