// REAL ESTATE PREDICTOR - MARKET ANALYTICS API
// Endpoint: GET /api/analytics

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    success: true,
    region: 'Greater London & South East',
    indexBenchmark: 'Nationwide House Price Index Q3 2026',
    macroIndicators: {
      annualCapitalGrowth: '+3.8%',
      averageGrossYield: '5.2%',
      averageDaysOnMarket: 34,
      buyerDemandIndex: 118,
      mortgageStressSpread: '4.65%'
    },
    topPerformingBoroughs: [
      { borough: 'Richmond upon Thames', avgPrice: '£890,000', yoy: '+5.4%' },
      { borough: 'Camden', avgPrice: '£880,000', yoy: '+4.2%' },
      { borough: 'Hackney', avgPrice: '£710,000', yoy: '+4.9%' },
      { borough: 'Islington', avgPrice: '£840,000', yoy: '+3.9%' }
    ],
    lastUpdated: new Date().toISOString()
  });
};
