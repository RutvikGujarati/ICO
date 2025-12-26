import { useState, useCallback } from 'react';
import { BrowserProvider, Contract, formatUnits, parseUnits, JsonRpcSigner, ZeroAddress, formatEther } from 'ethers';
import { CONFIG, ABIS } from '../config';

export interface PresaleState {
    account: string | null; chainId: bigint | null; currentPhase: number; currentPrice: string;
    phaseSold: string; phaseCap: string; dmxBalance: string; usdtBalance: string;
    bnbBalance: string; maxBuy: string; loading: boolean; connecting: boolean;
}

export const usePresale = () => {
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

    const [state, setState] = useState<PresaleState>({
        account: null, chainId: null, currentPhase: 1, currentPrice: "0", phaseSold: "0",
        phaseCap: "0", dmxBalance: "0", usdtBalance: "0", bnbBalance: "0", maxBuy: "0",
        loading: false, connecting: false
    });

    const refreshData = useCallback(async (currProv: BrowserProvider, currAcc: string) => {
        try {
            const presale = new Contract(CONFIG.PRESALE_ADDRESS, ABIS.PRESALE, currProv);
            const dmx = new Contract(CONFIG.DMX_ADDRESS, ABIS.ERC20, currProv);
            const usdt = new Contract(CONFIG.USDT_ADDRESS, ABIS.ERC20, currProv);

            const [idx, maxBuy] = await Promise.all([presale.currentPhaseIndex(), presale.maxBuyAmount()]);
            const phase = await presale.phases(idx);
            const [dmxBal, usdtBal, bnbBal] = await Promise.all([
                dmx.balanceOf(currAcc), usdt.balanceOf(currAcc), currProv.getBalance(currAcc)
            ]);

            setState(p => ({
                ...p, account: currAcc, currentPhase: Number(idx) + 1,
                currentPrice: formatUnits(phase.price, 18), phaseSold: formatUnits(phase.sold, 18),
                phaseCap: formatUnits(phase.totalCap, 18), maxBuy: formatUnits(maxBuy, 18),
                dmxBalance: formatUnits(dmxBal, 18), usdtBalance: formatUnits(usdtBal, 18),
                bnbBalance: formatEther(bnbBal)
            }));
        } catch (e) { console.error(e); }
    }, []);

    const connectWallet = async () => {
        if (!(window as any).ethereum) return alert("Install MetaMask");
        setState(p => ({ ...p, connecting: true }));
        try {
            const p = new BrowserProvider((window as any).ethereum);
            const s = await p.getSigner();
            const a = await s.getAddress();
            setProvider(p); setSigner(s);
            await refreshData(p, a);
        } catch (e) { console.error(e); }
        finally { setState(p => ({ ...p, connecting: false })); }
    };

    const buyTokens = async (usdtAmt: string, ref: string) => {
        if (!signer || !state.account) return alert("Connect Wallet");
        setState(p => ({ ...p, loading: true }));
        try {
            const usdt = new Contract(CONFIG.USDT_ADDRESS, ABIS.ERC20, signer);
            const presale = new Contract(CONFIG.PRESALE_ADDRESS, ABIS.PRESALE, signer);

            const price = parseFloat(state.currentPrice) || 1;
            const dmxAmt = parseFloat(usdtAmt) / price;
            const usdtWei = parseUnits(usdtAmt, 18);
            const dmxWei = parseUnits(dmxAmt.toFixed(18), 18);

            const allowance = await usdt.allowance(state.account, CONFIG.PRESALE_ADDRESS);
            if (allowance < usdtWei) {
                const txApprove = await usdt.approve(CONFIG.PRESALE_ADDRESS, usdtWei);
                await txApprove.wait();
            }

            const txBuy = await presale.buyTokens(dmxWei, (ref && ref.length === 42) ? ref : ZeroAddress);
            await txBuy.wait();

            alert("Purchase Successful");
            if (provider) await refreshData(provider, state.account);
        } catch (e: any) { alert(e.reason || e.message); }
        finally { setState(p => ({ ...p, loading: false })); }
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
            if (provider) await refreshData(provider, state.account);
        } catch (e: any) { alert(e.reason || e.message); }
        finally { setState(p => ({ ...p, loading: false })); }
    };

    return { ...state, connectWallet, buyTokens, sellTokens };
};