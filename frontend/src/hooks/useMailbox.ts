import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseAbiItem, parseEther } from 'viem';
import { DecentralizedMailABI, CONTRACT_ADDRESS, DEPLOYMENT_BLOCK } from '../utils/abi';

export function useMailbox() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const registerAlias = async (aliasName: string) => {
    if (!walletClient || !publicClient) throw new Error("Wallet not connected");
    
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: DecentralizedMailABI,
      functionName: 'registerAlias',
      args: [aliasName],
    });
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'reverted') throw new Error("Transaction reverted on chain");
    return hash;
  };

  const registerGaslessAlias = async (aliasName: string) => {
    if (!address) throw new Error("Please connect your wallet first");
    const res = await fetch('/api/relayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'registerAlias', alias: aliasName, userAddress: address })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gasless alias registration failed');
    return data.txHash;
  };

  const signMessageText = async (text: string) => {
    if (!walletClient) throw new Error("Wallet not connected");
    return await walletClient.signMessage({ message: text });
  };

  const sendNativePayment = async (toAddress: string, amountInBot: string) => {
    if (!walletClient || !publicClient) throw new Error("Wallet not connected");
    const hash = await walletClient.sendTransaction({
      to: toAddress as `0x${string}`,
      value: parseEther(amountInBot)
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'reverted') throw new Error("Payment transaction reverted on BotChain");
    return hash;
  };

  const sendMessage = async (toAlias: string, contentCID: string) => {
    if (!walletClient || !publicClient) throw new Error("Wallet not connected");

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: DecentralizedMailABI,
      functionName: 'sendMessage',
      args: [toAlias, contentCID],
    });
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'reverted') throw new Error("Transaction reverted on chain");
    return hash;
  };

  const sendGaslessMessage = async (toAlias: string, contentCID: string) => {
    if (!address) throw new Error("Please connect your wallet first");
    const res = await fetch('/api/relayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sendMessage', toAlias, contentCID, fromAddress: address })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gasless dispatch failed');
    return data.txHash;
  };

  const getMyMessages = async () => {
    if (!publicClient || !address) return [];

    try {
      // Create the event definition for viem
      const messageSentEvent = parseAbiItem('event MessageSent(address indexed from, address indexed to, string contentCID, uint256 timestamp)');
      
      // Query the RPC for past events addressed to the user
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS as `0x${string}`,
        event: messageSentEvent,
        args: {
          to: address as `0x${string}`
        },
        fromBlock: DEPLOYMENT_BLOCK,
        toBlock: 'latest'
      });
      
      return logs.map((log) => ({
        sender: log.args.from,
        contentCID: log.args.contentCID,
        timestamp: Number(log.args.timestamp) * 1000 // Convert to JS ms
      }));
    } catch (e) {
      console.error("Failed to fetch messages from events", e);
      return [];
    }
  };

  const getSentMessages = async () => {
    if (!publicClient || !address) return [];

    try {
      const messageSentEvent = parseAbiItem('event MessageSent(address indexed from, address indexed to, string contentCID, uint256 timestamp)');
      
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS as `0x${string}`,
        event: messageSentEvent,
        args: {
          from: address as `0x${string}`
        },
        fromBlock: DEPLOYMENT_BLOCK,
        toBlock: 'latest'
      });
      
      return logs.map((log) => ({
        recipient: log.args.to,
        contentCID: log.args.contentCID,
        timestamp: Number(log.args.timestamp) * 1000
      }));
    } catch (e) {
      console.error("Failed to fetch sent messages from events", e);
      return [];
    }
  };

  const getMyAlias = async () => {
    if (!publicClient || !address) return null;

    try {
      const alias = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: DecentralizedMailABI,
        functionName: 'getMyAlias',
        account: address as `0x${string}`,
      }) as string;
      return alias || null;
    } catch (e) {
      return null;
    }
  };

  const checkAliasAvailability = async (aliasName: string) => {
    if (!publicClient) return false;
    try {
      const ownerAddress = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: DecentralizedMailABI,
        functionName: 'aliasToAddress',
        args: [aliasName],
      }) as string;
      // If it returns the zero address, it's available
      return ownerAddress === '0x0000000000000000000000000000000000000000';
    } catch (e) {
      return false;
    }
  };

  const resolveAlias = async (aliasName: string) => {
    if (!publicClient) return null;
    try {
      const ownerAddress = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: DecentralizedMailABI,
        functionName: 'aliasToAddress',
        args: [aliasName],
      }) as string;
      return ownerAddress === '0x0000000000000000000000000000000000000000' ? null : ownerAddress;
    } catch (e) {
      return null;
    }
  };

  const getAliasForAddress = async (walletAddress: string) => {
    if (!publicClient) return null;
    try {
      const alias = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: DecentralizedMailABI,
        functionName: 'addressToAlias',
        args: [walletAddress as `0x${string}`],
      }) as string;
      return alias || null;
    } catch (e) {
      return null;
    }
  };

  return {
    registerAlias,
    registerGaslessAlias,
    sendMessage,
    sendGaslessMessage,
    sendNativePayment,
    signMessageText,
    getMyMessages,
    getSentMessages,
    getMyAlias,
    checkAliasAvailability,
    resolveAlias,
    getAliasForAddress
  };
}
