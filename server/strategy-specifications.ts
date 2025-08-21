import { storage } from "./storage";

export interface StrategySpecification {
  id: string;
  name: string;
  optimalStartingSol: number;
  projectedImpact: {
    dailyProfit: number;
    weeklyProfit: number;
    monthlyProfit: number;
    riskLevel: "Low" | "Medium" | "High";
    successRate: number;
    scalabilityFactor: number;
  };
  requirements: {
    minimumBalance: number;
    gasReserve: number;
    platformFees: number;
  };
  stageProgression: {
    stage10Impact: number;
    stage20Impact: number;
    leverageMultiplier: number;
  };
  description: string;
  technicalDetails: string[];
}

export const ELITE_FLASH_STRATEGIES: StrategySpecification[] = [
  {
    id: "infinite-glitch",
    name: "Infinite Money Glitch",
    optimalStartingSol: 25.0,
    projectedImpact: {
      dailyProfit: 3.5,
      weeklyProfit: 24.5,
      monthlyProfit: 105.0,
      riskLevel: "Medium",
      successRate: 0.87,
      scalabilityFactor: 2.3
    },
    requirements: {
      minimumBalance: 20.0,
      gasReserve: 2.0,
      platformFees: 0.15
    },
    stageProgression: {
      stage10Impact: 85.0,
      stage20Impact: 340.0,
      leverageMultiplier: 7.2
    },
    description: "Recursive flash loan strategy with 7-level compounding at 0.03% per recursion. Creates self-reinforcing profit loops through calculated reinvestment.",
    technicalDetails: [
      "7-level recursion depth with exponential compounding",
      "0.03% profit increase per recursion level",
      "70% profit reinvestment into next flash loan cycle",
      "Glitch detection when profit exceeds 50% of flash loan amount",
      "Maximum flash loan capacity: 1,000 SOL per cycle"
    ]
  },
  {
    id: "vampire-pool",
    name: "Vampire Pool Drainer",
    optimalStartingSol: 40.0,
    projectedImpact: {
      dailyProfit: 8.2,
      weeklyProfit: 57.4,
      monthlyProfit: 246.0,
      riskLevel: "High",
      successRate: 0.73,
      scalabilityFactor: 1.8
    },
    requirements: {
      minimumBalance: 35.0,
      gasReserve: 3.5,
      platformFees: 0.25
    },
    stageProgression: {
      stage10Impact: 164.0,
      stage20Impact: 820.0,
      leverageMultiplier: 5.8
    },
    description: "Targets high-liquidity pools for systematic capital extraction at 15% maximum drainage rate across 8 primary pools.",
    technicalDetails: [
      "Targets: ORCA/SOL-USDC, RAY/SOL-USDC, SRM/SOL-USDC pools",
      "15% maximum extraction per pool to avoid detection",
      "Pool vulnerability analysis with 60%+ confidence threshold",
      "Alpha/Beta vampire classification based on drainage efficiency",
      "Real-time liquidity depth monitoring (50-250 SOL pools)"
    ]
  },
  {
    id: "triangular-dex",
    name: "Triangular Cross-DEX Arbitrage",
    optimalStartingSol: 15.0,
    projectedImpact: {
      dailyProfit: 2.1,
      weeklyProfit: 14.7,
      monthlyProfit: 63.0,
      riskLevel: "Low",
      successRate: 0.92,
      scalabilityFactor: 3.1
    },
    requirements: {
      minimumBalance: 12.0,
      gasReserve: 1.5,
      platformFees: 0.08
    },
    stageProgression: {
      stage10Impact: 42.0,
      stage20Impact: 210.0,
      leverageMultiplier: 4.5
    },
    description: "Multi-path arbitrage across Orca, Raydium, Serum, Jupiter, and Aldrin using SOL/USDC/RAY/ORCA/SRM triangular paths.",
    technicalDetails: [
      "5 DEX platforms: Orca, Raydium, Serum, Jupiter, Aldrin",
      "Triangular paths: SOL→USDC→RAY→SOL, SOL→ORCA→USDC→SOL",
      "Minimum 0.1% profit threshold per path execution",
      "Gas efficiency optimization: 70-100% efficiency rating",
      "Price impact analysis with <0.5% maximum slippage"
    ]
  },
  {
    id: "cross-chain",
    name: "Cross-Chain Flash Arbitrage",
    optimalStartingSol: 60.0,
    projectedImpact: {
      dailyProfit: 4.8,
      weeklyProfit: 33.6,
      monthlyProfit: 144.0,
      riskLevel: "Medium",
      successRate: 0.79,
      scalabilityFactor: 2.7
    },
    requirements: {
      minimumBalance: 50.0,
      gasReserve: 5.0,
      platformFees: 0.35
    },
    stageProgression: {
      stage10Impact: 96.0,
      stage20Impact: 576.0,
      leverageMultiplier: 6.2
    },
    description: "Arbitrage across Ethereum, Polygon, Arbitrum, Optimism using Wormhole, Allbridge, Portal bridges with automatic staked position creation.",
    technicalDetails: [
      "5 supported chains: Ethereum, Polygon, Arbitrum, Optimism, Avalanche",
      "Bridge protocols: Wormhole, Allbridge, Portal with 0.1-0.4% fees",
      "Minimum 0.5% profit after bridge fees required",
      "Auto-creates free staked positions when profit >1 SOL",
      "Cross-chain liquidity depth: 50-550 SOL equivalent"
    ]
  },
  {
    id: "quantum-flash",
    name: "Quantum Flash Loan (20-Stage System)",
    optimalStartingSol: 10.0,
    projectedImpact: {
      dailyProfit: 1.8,
      weeklyProfit: 12.6,
      monthlyProfit: 54.0,
      riskLevel: "Low",
      successRate: 0.95,
      scalabilityFactor: 8.5
    },
    requirements: {
      minimumBalance: 8.0,
      gasReserve: 1.0,
      platformFees: 0.05
    },
    stageProgression: {
      stage10Impact: 320.0,
      stage20Impact: 2560.0,
      leverageMultiplier: 15.8
    },
    description: "Exponential growth system: 10→20→40→80 SOL with 10% multiplier increases. MarginFi leverage at stage 10+, Jito stakes at 15+.",
    technicalDetails: [
      "Stage 1-10: Flash loan size doubles each day (10, 20, 40, 80, 160...)",
      "10% quantum multiplier increase per stage compounding",
      "Stage 10+: MarginFi leverage positions with 3-10x multipliers",
      "Stage 15+: Jito stake account creation from profits",
      "Stage 20: Cross-chain free staked positions (ultimate goal)"
    ]
  },
  {
    id: "perpetual-positions",
    name: "Free Perpetual Positions Strategy",
    optimalStartingSol: 30.0,
    projectedImpact: {
      dailyProfit: 5.2,
      weeklyProfit: 36.4,
      monthlyProfit: 156.0,
      riskLevel: "Medium",
      successRate: 0.84,
      scalabilityFactor: 2.9
    },
    requirements: {
      minimumBalance: 25.0,
      gasReserve: 2.5,
      platformFees: 0.18
    },
    stageProgression: {
      stage10Impact: 104.0,
      stage20Impact: 520.0,
      leverageMultiplier: 12.5
    },
    description: "Creates free leveraged positions on Mango, Drift, Zeta, 01 platforms using arbitrage profits for funding with 5-20x leverage.",
    technicalDetails: [
      "4 perpetual platforms: Mango, Drift, Zeta, 01",
      "Flash loan funding: 50-150 SOL per position creation",
      "Leverage range: 5-20x based on platform and market conditions",
      "Minimum 0.5 SOL arbitrage profit required per position",
      "Free position value accumulation without capital requirement"
    ]
  },
  {
    id: "marginfi-leverage",
    name: "MarginFi Maximum Leverage Extraction",
    optimalStartingSol: 50.0,
    projectedImpact: {
      dailyProfit: 7.5,
      weeklyProfit: 52.5,
      monthlyProfit: 225.0,
      riskLevel: "High",
      successRate: 0.76,
      scalabilityFactor: 4.2
    },
    requirements: {
      minimumBalance: 45.0,
      gasReserve: 4.0,
      platformFees: 0.30
    },
    stageProgression: {
      stage10Impact: 300.0,
      stage20Impact: 1500.0,
      leverageMultiplier: 18.7
    },
    description: "Maximum leverage extraction using MarginFi's lending pools. Creates largest possible flash loans through recursive borrowing.",
    technicalDetails: [
      "MarginFi lending pool integration for maximum borrowing capacity",
      "Recursive leverage: borrow against collateral to increase position size",
      "3-10x leverage multipliers based on collateral quality",
      "Stage 10+ focus: Use daily profits to create leveraged positions",
      "Position management: auto-rebalancing to maintain optimal ratios"
    ]
  },
  {
    id: "jito-stake-farming",
    name: "Jito Stake Farming & MEV Extraction",
    optimalStartingSol: 35.0,
    projectedImpact: {
      dailyProfit: 3.8,
      weeklyProfit: 26.6,
      monthlyProfit: 114.0,
      riskLevel: "Low",
      successRate: 0.89,
      scalabilityFactor: 3.8
    },
    requirements: {
      minimumBalance: 30.0,
      gasReserve: 2.8,
      platformFees: 0.12
    },
    stageProgression: {
      stage10Impact: 76.0,
      stage20Impact: 456.0,
      leverageMultiplier: 8.3
    },
    description: "Jito liquid staking integration with MEV extraction. Creates Jito stake accounts from arbitrage profits for yield generation.",
    technicalDetails: [
      "Jito liquid staking token (jitoSOL) farming",
      "MEV extraction through Jito validator network participation",
      "Stage 15+ activation: Jito stake account creation from profits",
      "Compound yield: staking rewards + MEV tips + arbitrage profits",
      "Auto-compounding mechanism for maximum yield optimization"
    ]
  }
];

export async function getStrategySpecifications(): Promise<StrategySpecification[]> {
  await storage.createActivity({
    agentId: "strategy-specifications",
    type: "specifications_requested",
    description: "Strategy specifications with optimal starting SOL and projected impacts retrieved",
    projectId: null,
    metadata: { 
      totalStrategies: ELITE_FLASH_STRATEGIES.length,
      totalOptimalCapital: ELITE_FLASH_STRATEGIES.reduce((sum, s) => sum + s.optimalStartingSol, 0),
      projectedMonthlyTotal: ELITE_FLASH_STRATEGIES.reduce((sum, s) => sum + s.projectedImpact.monthlyProfit, 0)
    }
  });

  return ELITE_FLASH_STRATEGIES;
}

export function calculatePortfolioOptimization(availableSOL: number): {
  recommendedAllocation: { strategyId: string; allocation: number; expectedReturn: number }[];
  totalExpectedDaily: number;
  totalExpectedMonthly: number;
  riskProfile: string;
} {
  const sortedStrategies = [...ELITE_FLASH_STRATEGIES].sort((a, b) => 
    (b.projectedImpact.dailyProfit / b.optimalStartingSol) - (a.projectedImpact.dailyProfit / a.optimalStartingSol)
  );

  const allocation: { strategyId: string; allocation: number; expectedReturn: number }[] = [];
  let remainingSOL = availableSOL;
  let totalExpectedDaily = 0;

  for (const strategy of sortedStrategies) {
    if (remainingSOL >= strategy.optimalStartingSol) {
      const allocation_amount = Math.min(remainingSOL, strategy.optimalStartingSol * 2); // Max 2x optimal
      allocation.push({
        strategyId: strategy.id,
        allocation: allocation_amount,
        expectedReturn: (allocation_amount / strategy.optimalStartingSol) * strategy.projectedImpact.dailyProfit
      });
      totalExpectedDaily += (allocation_amount / strategy.optimalStartingSol) * strategy.projectedImpact.dailyProfit;
      remainingSOL -= allocation_amount;
    }
  }

  const riskProfile = totalExpectedDaily > 20 ? "Aggressive" : totalExpectedDaily > 10 ? "Moderate" : "Conservative";

  return {
    recommendedAllocation: allocation,
    totalExpectedDaily,
    totalExpectedMonthly: totalExpectedDaily * 30,
    riskProfile
  };
}