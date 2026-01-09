import { useState, useCallback, useEffect } from 'react';
import {
    BrowserProvider,
    Contract,
    formatUnits,
    parseUnits,
    JsonRpcSigner,
    ZeroAddress,
    formatEther,
    MaxUint256
} from 'ethers';
import { CONFIG, ABIS } from '../config';

export interface PresaleState {
    account: string | null;
    chainId: bigint | null;
    currentPhase: number;
    currentPrice: string;
    phaseSold: string;
    phaseCap: string;
    dmxBalance: string;
    headline: string;
    registeredEmail: string;
    emailLoading: boolean;
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
    emailLoading: false,
    registeredEmail: "",
    headline: "",
    phaseCap: "0",
    dmxBalance: "0",
    usdtBalance: "0",
    bnbBalance: "0",
    maxBuy: "0",
    loading: false,
    connecting: false
};

type ToastFn = (msg: string, type?: 'success' | 'error' | 'info') => void;

// Helper to detect mobile devices
const isMobileDevice = () => {
    return 'ontouchstart' in window || /iPad|iPhone|iPod|Android/i.test(navigator.userAgent);
};

export const usePresale = (toast?: ToastFn) => {
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    const [state, setState] = useState<PresaleState>(initialState);

    const isValidAmount = (value: string) => {
        if (!value) return false;
        if (value === '.' || value === '0.') return false;
        const n = Number(value);
        return Number.isFinite(n) && n > 0;
    };

    const switchNetwork = async () => {
        if (!(window as any).ethereum) {
            toast?.("Please install MetaMask", "error");
            return false;
        }
        try {
            await (window as any).ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x38' }],
            });
            return true;
        } catch (error: any) {
            if (error.code === 4902) {
                try {
                    await (window as any).ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x38',
                            chainName: 'BNB Smart Chain Mainnet',
                            nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                            rpcUrls: ['https://public-bsc-mainnet.fastnode.io'],
                            blockExplorerUrls: ['https://bscscan.com/']
                        }],
                    });
                    return true;
                } catch {
                    toast?.("Failed to add BSC network", "error");
                    return false;
                }
            }
            toast?.("Network switch rejected", "error");
            return false;
        }
    };

    const refreshData = useCallback(async (currProv: BrowserProvider, currAcc: string) => {
        try {
            const net = await currProv.getNetwork();
            if (net.chainId !== BigInt(56)) return;

            const presale = new Contract(CONFIG.PRESALE_ADDRESS, ABIS.PRESALE, currProv);
            const dmx = new Contract(CONFIG.DMX_ADDRESS, ABIS.ERC20, currProv);
            const usdt = new Contract(CONFIG.USDT_ADDRESS, ABIS.ERC20, currProv);

            const idx = await presale.currentPhaseIndex();
            const phase = await presale.phases(idx);

            const [dmxBal, usdtBal, bnbBal, headline, email] = await Promise.all([
                dmx.balanceOf(currAcc),
                usdt.balanceOf(currAcc),
                currProv.getBalance(currAcc),
                presale.newsHeadline(),
                presale.userEmails(currAcc)
            ]);

            setState(p => ({
                ...p,
                account: currAcc,
                chainId: net.chainId,
                currentPhase: Number(idx) + 1,
                currentPrice: formatUnits(phase.price, 18),
                phaseSold: formatUnits(phase.sold, 18),
                phaseCap: formatUnits(phase.totalCap, 18),
                dmxBalance: formatUnits(dmxBal, 18),
                usdtBalance: formatUnits(usdtBal, 18),
                bnbBalance: formatEther(bnbBal),
                headline,
                registeredEmail: email
            }));
        } catch (e) {
            console.error(e);
        }
    }, []);

    const registerEmail = async (email: string) => {
        if (!signer || !state.account) {
            toast?.("Connect wallet first", "error");
            return;
        }

        setState(p => ({ ...p, emailLoading: true }));

        try {
            const presale = new Contract(CONFIG.PRESALE_ADDRESS, ABIS.PRESALE, signer);
            const tx = await presale.registerEmail(email);
            await tx.wait();

            setState(p => ({ ...p, registeredEmail: email }));
            toast?.("Email registered successfully", "success");
        } catch (e: any) {
            toast?.(e.reason || e.message, "error");
        } finally {
            setState(p => ({ ...p, emailLoading: false }));
        }
    };

    const connectWallet = async () => {
        // 1. Check if MetaMask (or other injected provider) is present
        if (!(window as any).ethereum) {
            // 2. If on mobile and no provider, Deep Link to MetaMask App
            if (isMobileDevice()) {
                toast?.("Opening MetaMask...", "info");
                // Construct the deep link URL (stripping protocol to avoid issues)
                const host = window.location.host;
                const path = window.location.pathname;
                const dappUrl = `${host}${path}`;

                window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
                return;
            }

            toast?.("Install MetaMask", "error");
            return;
        }

        setState(p => ({ ...p, connecting: true }));
        try {
            const switched = await switchNetwork();
            if (!switched) {
                setState(p => ({ ...p, connecting: false }));
                return;
            }

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
        toast?.("Wallet disconnected", "info");
    };

    useEffect(() => {
        const init = async () => {
            if ((window as any).ethereum) {
                const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) connectWallet();
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
            (window as any).ethereum?.removeAllListeners();
        };
    }, []);

    const buyTokens = async (usdtAmount: string, referrer: string, email: string) => {
        if (!isValidAmount(usdtAmount)) {
            toast?.("Please enter a valid amount", "error");
            return;
        }
        if (!signer || !provider) {
            toast?.("Connect wallet first", "error");
            return;
        }

        const account = await signer.getAddress();
        setState(p => ({ ...p, loading: true }));

        try {
            const usdt = new Contract(CONFIG.USDT_ADDRESS, ABIS.ERC20, signer);
            const presale = new Contract(CONFIG.PRESALE_ADDRESS, ABIS.PRESALE, signer);

            const price = parseFloat(state.currentPrice) || 1;
            const dmxWei = parseUnits((parseFloat(usdtAmount) / price).toFixed(18), 18);
            const usdtWei = parseUnits(usdtAmount, 18);
            const ref = referrer?.length === 42 ? referrer : ZeroAddress;

            if ((await usdt.allowance(account, CONFIG.PRESALE_ADDRESS)) < usdtWei) {
                const txApprove = await usdt.approve(CONFIG.PRESALE_ADDRESS, MaxUint256);
                await txApprove.wait();
            }

            const tx = await presale.buyTokens(dmxWei, ref, email || "");
            await tx.wait();

            await refreshData(provider, account);
            toast?.("Purchase successful", "success");
        } catch (e: any) {
            toast?.(e.reason || e.message, "error");
        } finally {
            setState(p => ({ ...p, loading: false }));
        }
    };

    const sellTokens = async (dmxAmt: string) => {
        if (!signer || !provider) {
            toast?.("Connect wallet first", "error");
            return;
        }
        if (!isValidAmount(dmxAmt)) {
            toast?.("Please enter a valid amount", "error");
            return;
        }
        const account = await signer.getAddress();
        setState(p => ({ ...p, loading: true }));

        try {
            const dmx = new Contract(CONFIG.DMX_ADDRESS, ABIS.ERC20, signer);
            const presale = new Contract(CONFIG.PRESALE_ADDRESS, ABIS.PRESALE, signer);
            const dmxWei = parseUnits(dmxAmt, 18);

            if ((await dmx.allowance(account, CONFIG.PRESALE_ADDRESS)) < dmxWei) {
                const txApprove = await dmx.approve(CONFIG.PRESALE_ADDRESS, dmxWei);
                await txApprove.wait();
            }

            const tx = await presale.sellBack(dmxWei);
            await tx.wait();

            await refreshData(provider, account);
            toast?.("Tokens sold successfully", "success");
        } catch (e: any) {
            toast?.(e.reason || e.message, "error");
        } finally {
            setState(p => ({ ...p, loading: false }));
        }
    };

    return {
        ...state,
        connectWallet,
        disconnectWallet,
        buyTokens,
        sellTokens,
        registerEmail
    };
};