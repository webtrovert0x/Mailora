import { parseAbi } from 'viem';

export const MailoraABI = parseAbi([
  // Read
  "function aliasToAddress(string) view returns (address)",
  "function addressToAlias(address) view returns (string)",
  "function getMyAlias() view returns (string)",
  "function relayer() view returns (address)",
  "function owner() view returns (address)",
  
  // Write
  "function registerAlias(string _alias)",
  "function registerAliasFor(address _user, string _alias)",
  "function sendMessage(string _toAlias, string _contentCID) payable",
  "function sendMessageFor(address _from, string _toAlias, string _contentCID) payable",

  // Events
  "event AliasRegistered(address indexed user, string aliasName)",
  "event MessageSent(address indexed from, address indexed to, string contentCID, uint256 timestamp)"
]);

export const DecentralizedMailABI = MailoraABI;

// BOT Chain Mainnet Contract Address (can be overridden by NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local)
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xC0DE8FE984F889f8a7367BD1DE8DBBBFB05cE13a") as `0x${string}`;
export const DEPLOYMENT_BLOCK = BigInt(process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK || "0");

export const EXPLORER_BASE_URL = "https://scan.botchain.ai";
export const RPC_URL = "https://rpc.botchain.ai";
export const CHAIN_ID = 677;

export function getExplorerAddressUrl(address: string) {
  return `${EXPLORER_BASE_URL}/address/${address}`;
}

export function getExplorerTxUrl(hash: string) {
  return `${EXPLORER_BASE_URL}/tx/${hash}`;
}
