import { UserStats, LeaderboardRow, MatchHistory, Problem } from "./types";

export const INITIAL_USER_STATS: UserStats = {
  id: "player_user",
  username: "vortex_hacker",
  builderRating: 1480,
  breakerRating: 1540,
  overallRating: 1510,
  winRate: 68,
  winStreak: 4,
  matchesPlayed: 74,
  vulnerabilitiesFound: 118,
  problemsSolved: 48,
  tier: "Expert",
  favoriteLanguage: "python",
  rankBadge: "⚡ EXPERT II"
};

export const MOCK_LEADERBOARD_OVERALL: LeaderboardRow[] = [
  { rank: 1, username: "sys_root_kill", overallRating: 2850, builderRating: 2900, breakerRating: 2800, tier: "Grandmaster", trend: "up", winRate: 84 },
  { rank: 2, username: "kernel_panic", overallRating: 2710, builderRating: 2600, breakerRating: 2820, tier: "Grandmaster", trend: "stable", winRate: 79 },
  { rank: 3, username: "lambda_ninja", overallRating: 2540, builderRating: 2650, breakerRating: 2430, tier: "Master", trend: "up", winRate: 74 },
  { rank: 4, username: "stack_overflow_god", overallRating: 2490, builderRating: 2510, breakerRating: 2470, tier: "Master", trend: "down", winRate: 72 },
  { rank: 5, username: "cyber_phreak", overallRating: 2280, builderRating: 2200, breakerRating: 2360, tier: "Expert", trend: "up", winRate: 69 },
  { rank: 6, username: "vortex_hacker", overallRating: 1510, builderRating: 1480, breakerRating: 1540, tier: "Expert", trend: "up", winRate: 68 },
  { rank: 7, username: "null_pointer_jockey", overallRating: 1450, builderRating: 1390, breakerRating: 1510, tier: "Expert", trend: "stable", winRate: 61 },
  { rank: 8, username: "cpp_gandalf", overallRating: 1380, builderRating: 1460, breakerRating: 1300, tier: "Advanced", trend: "down", winRate: 58 }
];

export const MOCK_LEADERBOARD_BUILDERS: LeaderboardRow[] = [
  { rank: 1, username: "sys_root_kill", overallRating: 2850, builderRating: 2900, breakerRating: 2800, tier: "Grandmaster", trend: "up", winRate: 84 },
  { rank: 2, username: "lambda_ninja", overallRating: 2540, builderRating: 2650, breakerRating: 2430, tier: "Master", trend: "up", winRate: 74 },
  { rank: 3, username: "stack_overflow_god", overallRating: 2490, builderRating: 2510, breakerRating: 2470, tier: "Master", trend: "down", winRate: 72 },
  { rank: 4, username: "vortex_hacker", overallRating: 1510, builderRating: 1480, breakerRating: 1540, tier: "Expert", trend: "up", winRate: 68 }
];

export const MOCK_LEADERBOARD_BREAKERS: LeaderboardRow[] = [
  { rank: 1, username: "kernel_panic", overallRating: 2710, builderRating: 2600, breakerRating: 2820, tier: "Grandmaster", trend: "stable", winRate: 79 },
  { rank: 2, username: "sys_root_kill", overallRating: 2850, builderRating: 2900, breakerRating: 2800, tier: "Grandmaster", trend: "up", winRate: 84 },
  { rank: 3, username: "vortex_hacker", overallRating: 1510, builderRating: 1480, breakerRating: 1540, tier: "Expert", trend: "up", winRate: 68 },
  { rank: 4, username: "cyber_phreak", overallRating: 2280, builderRating: 2200, breakerRating: 2360, tier: "Expert", trend: "up", winRate: 69 }
];

export const MOCK_RECENT_MATCHES: MatchHistory[] = [
  {
    id: "match-01",
    opponentName: "kernel_panic",
    opponentRating: 2680,
    problemTitle: "Cryptographic Prime Verifier overflow",
    date: "2026-06-18",
    result: "VICTORY",
    builderScore: 92,
    breakerScore: 30,
    pointsExchanged: +28
  },
  {
    id: "match-02",
    opponentName: "cyber_phreak",
    opponentRating: 2210,
    problemTitle: "Weighted Graph Network Loop limits",
    date: "2026-06-15",
    result: "VICTORY",
    builderScore: 85,
    breakerScore: 25,
    pointsExchanged: +19
  },
  {
    id: "match-03",
    opponentName: "sys_root_kill",
    opponentRating: 2890,
    problemTitle: "Binary Search Tree balanced state",
    date: "2026-06-10",
    result: "DEFEAT",
    builderScore: 40,
    breakerScore: 10,
    pointsExchanged: -32
  }
];

export const SAMPLE_OPPONENT_CODES: Record<string, string> = {
  python: `def verify_packet_signature(payload: str, secret: int) -> str:
    # Opponent solution
    # Bug hint: Empty string input leads to Index Error when assessing payload[0]!
    # Vulnerable to O(N^2) recursive call if matching cyclic prefixes!
    if not payload:
        return "" # returns empty instead of "VERIFIED" mismatch
    
    val = 0
    # O(N^2) Nested check to verify character matches which timeouts on 10^5 length
    for i in range(len(payload)):
        for j in range(i + 1):
            val += ord(payload[j]) * secret
            
    hash_val = val % (10**9 + 7)
    return "VERIFIED" if hash_val > 0 else "FAILED"
`,
  javascript: `function mergeIntervals(intervals) {
    // Opponent solution
    // Bug hint: Mutates items during linear loop with negative array reference checks!
    // Out of memory bounds if intervals has empty or null bounds
    if (intervals === null || intervals.length === 0) {
        return [];
    }
    
    // sorting intervals without direction (default string sort!)
    intervals.sort(); // Crucial logical bug! sorts [[10, 15], [2, 3]] as string order!
    
    const merged = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
        const last = merged[merged.length - 1];
        const curr = intervals[i];
        
        // Timeout hazard: nested scan on large lists
        for (let j = 0; j < merged.length; j++) {
            if (curr[0] <= last[1]) {
                last[1] = Math.max(last[1], curr[1]);
            } else {
                merged.push(curr);
            }
        }
    }
    return merged;
}
`,
  cpp: `#include <string>
#include <vector>

std::string verifyPacketSignature(std::string payload, int secret) {
    // Standard signature algorithm
    // Bug hint: Integer overflow during multiplication signature sum!
    int hash = 0;
    for (int i = 0; i < payload.length(); ++i) {
        // Multiplies directly into raw signed 32-bit integer causing cyclic overflow wrapper
        hash = hash * secret + payload[i];
    }
    return (hash > 0) ? "VERIFIED" : "FAILED";
}
`,
  java: `import java.util.*;

public class Solution {
    public static String resolveDependencies(int nodes, int[][] edges) {
        // Deep recursive solver without loop memoization
        // Bug hint: StackOverflowError occurs when recursion stack goes past nodes limits!
        Map<Integer, List<Integer>> adj = new HashMap<>();
        for(int[] e : edges) {
            adj.putIfAbsent(e[0], new ArrayList<>());
            adj.get(e[0]).add(e[1]);
        }
        
        boolean[] path = new boolean[nodes];
        dfs(0, adj, path); // recursive loop crash trigger on deep trees
        return "SAFE";
    }

    private static void dfs(int node, Map<Integer, List<Integer>> adj, boolean[] path) {
        path[node] = true;
        if (adj.get(node) != null) {
            for (int neighbor : adj.get(node)) {
                dfs(neighbor, adj, path);
            }
        }
        path[node] = false;
    }
}
`
};
