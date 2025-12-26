export const CONFIG = {
  CHAIN_ID: 97n, 
  CHAIN_NAME: "BNB Smart Chain Testnet",
  RPC_URL: "https://bsc-testnet-rpc.publicnode.com",
  PRESALE_ADDRESS: "0x459A438Fbe3Cb71f2F8e251F181576d5a035Faef",
  USDT_ADDRESS: "0xD5BA70D0cF16024210E4fB6B93F8793F98725448", 
  DMX_ADDRESS: "0xe4ae6F10ee1C8e2465D9975cb3325267A2025549"
};

export const ABIS = {
  ERC20: [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ],
  PRESALE: [
    "function buyTokens(uint256 _tokenAmount, address _referrer) external",
    "function sellBack(uint256 _tokenAmount) external",
    "function phases(uint256) view returns (uint256 totalCap, uint256 sold, uint256 price, bool isActive)",
    "function currentPhaseIndex() view returns (uint256)",
    "function maxBuyAmount() view returns (uint256)"
  ]
};