import { useState, useCallback, useEffect } from 'react';
import { BrowserProvider, Contract, formatUnits, parseUnits, JsonRpcSigner, ZeroAddress, formatEther, MaxUint256 } from 'ethers';
import { CONFIG, ABIS } from '../config';

export interface PresaleState {
    account: string | null;
    chainId: bigint | null;
    currentPhase: number;
    currentPrice: string;
    phaseSold: string;
    phaseCap: string;
    dmxBalance: string;
    usdtBalance: string;
    bnbBalance: string;
    maxBuy: string;
    loading: boolean;
    connecting: boolean;
}

const initialState: PresaleState = {
    account: null,
    chainId: null,
    currentPhase: 1,
    currentPrice: "0",
    phaseSold: "0",
    phaseCap: "0",
    dmxBalance: "0",
    usdtBalance: "0",
    bnbBalance: "0",
    maxBuy: "0",
    loading: false,
    connecting: false
};

export const usePresale = () => {
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    const [state, setState] = useState<PresaleState>(initialState);

    const switchNetwork = async () => {
        if (!(window as any).ethereum) return;
        try {
            await (window as any).ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x61' }], // 97 in hex
            });
            return true;
        } catch (error: any) {
            if (error.code === 4902) {
                try {
                    await (window as any).ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x61',
                            chainName: 'BNB Smart Chain Testnet',
                            nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
                            rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
                            blockExplorerUrls: ['https://testnet.bscscan.com']
                        }],
                    });
                    return true;
                } catch (addError) {
                    return false;
                }
            }
            return false;
        }
    };

    const refreshData = useCallback(async (currProv: BrowserProvider, currAcc: string) => {
        try {
            const net = await currProv.getNetwork();
            if (net.chainId !== BigInt(97)) {
                console.warn("Wrong Network");
                return;
            }

            const presale = new Contract(CONFIG.PRESALE_ADDRESS, ABIS.PRESALE, currProv);
            const dmx = new Contract(CONFIG.DMX_ADDRESS, ABIS.ERC20, currProv);
            const usdt = new Contract(CONFIG.USDT_ADDRESS, ABIS.ERC20, currProv);

            const [idx, maxBuy] = await Promise.all([presale.currentPhaseIndex(), presale.maxBuyAmount()]);
            const phase = await presale.phases(idx);

            const [dmxBal, usdtBal, bnbBal] = await Promise.all([
                dmx.balanceOf(currAcc),
                usdt.balanceOf(currAcc),
                currProv.getBalance(currAcc)
            ]);

            setState(p => ({
                ...p,
                account: currAcc,
                chainId: net.chainId,
                currentPhase: Number(idx) + 1,
                currentPrice: formatUnits(phase.price, 18),
                phaseSold: formatUnits(phase.sold, 18),
                phaseCap: formatUnits(phase.totalCap, 18),
                maxBuy: formatUnits(maxBuy, 18),
                dmxBalance: formatUnits(dmxBal, 18),
                usdtBalance: formatUnits(usdtBal, 18),
                bnbBalance: formatEther(bnbBal)
            }));
        } catch (e) {
            console.error("Fetch Data Error:", e);
        }
    }, []);

    const connectWallet = async () => {
        if (!(window as any).ethereum) return alert("Install MetaMask");
        setState(p => ({ ...p, connecting: true }));
        try {
            await switchNetwork();
            const p = new BrowserProvider((window as any).ethereum);
            const s = await p.getSigner();
            const a = await s.getAddress();

            setProvider(p);
            setSigner(s);
            await refreshData(p, a);
        } catch (e) {
            console.error(e);
        } finally {
            setState(p => ({ ...p, connecting: false }));
        }
    };

    const disconnectWallet = () => {
        setProvider(null);
        setSigner(null);
        setState(initialState);
    };

    useEffect(() => {
        const init = async () => {
            if ((window as any).ethereum) {
                const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    connectWallet();
                }
            }
        };
        init();

        if ((window as any).ethereum) {
            (window as any).ethereum.on('accountsChanged', (accs: string[]) => {
                if (accs.length > 0) connectWallet();
                else disconnectWallet();
            });
            (window as any).ethereum.on('chainChanged', () => window.location.reload());
        }
        return () => {
            if ((window as any).ethereum) {
                (window as any).ethereum.removeAllListeners();
            }
        };
    }, []);

 const buyTokens = async (usdtAmount: string, referrer: string) => {
    if (!signer || !state.account) return alert("Connect Wallet");
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const usdtContract = new Contract(CONFIG.USDT_ADDRESS, ABIS.ERC20, signer);
      const presaleContract = new Contract(CONFIG.PRESALE_ADDRESS, ABIS.PRESALE, signer);

      const price = parseFloat(state.currentPrice) || 1;
      const dmxAmountNum = parseFloat(usdtAmount) / price;
      
      const usdtWei = parseUnits(usdtAmount, 18);
      const dmxWei = parseUnits(dmxAmountNum.toFixed(18), 18);
      const refAddress = referrer && referrer.length === 42 ? referrer : ZeroAddress;

      // --- CHECK ALLOWANCE ---
      const allowance = await usdtContract.allowance(state.account, CONFIG.PRESALE_ADDRESS);
      
      if (allowance < usdtWei) {
        console.log("Approving Infinite USDT...");
        // Approve MaxUint256 (Infinite) instead of just usdtWei
        const txApprove = await usdtContract.approve(CONFIG.PRESALE_ADDRESS, MaxUint256);
        await txApprove.wait();
        console.log("Approval Confirmed");
      }

      // --- EXECUTE BUY ---
      const txBuy = await presaleContract.buyTokens(dmxWei, refAddress);
      await txBuy.wait();
      
      alert("Purchase Successful");
      if (provider && state.account) await refreshData(provider, state.account);
    } catch (err: any) {
      alert(err.reason || err.message);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };
    const sellTokens = async (dmxAmt: string) => {
        if (!signer || !state.account) return alert("Connect Wallet");
        setState(p => ({ ...p, loading: true }));
        try {
            const dmx = new Contract(CONFIG.DMX_ADDRESS, ABIS.ERC20, signer);
            const presale = new Contract(CONFIG.PRESALE_ADDRESS, ABIS.PRESALE, signer);
            const dmxWei = parseUnits(dmxAmt, 18);

            const allowance = await dmx.allowance(state.account, CONFIG.PRESALE_ADDRESS);
            if (allowance < dmxWei) {
                const txApprove = await dmx.approve(CONFIG.PRESALE_ADDRESS, dmxWei);
                await txApprove.wait();
            }

            const txSell = await presale.sellBack(dmxWei);
            await txSell.wait();

            alert("Sold Back Successfully");
            if (provider && state.account) await refreshData(provider, state.account);
        } catch (e: any) {
            alert(e.reason || e.message);
        } finally {
            setState(p => ({ ...p, loading: false }));
        }
    };

    return { ...state, connectWallet, disconnectWallet, buyTokens, sellTokens };
};