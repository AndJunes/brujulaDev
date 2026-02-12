"use client";

import { useState, useEffect } from "react";
import { 
  isConnected as checkIsConnected, 
  getAddress, 
  signTransaction,
  requestAccess 
} from "@stellar/freighter-api";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      console.log('🔄 Verificando conexión Freighter...');
      const connected = await checkIsConnected();
      console.log('📱 ¿Conectado?', connected);
      
      if (connected) {
        const result = await getAddress();
        // La API devuelve { address: string }
        const walletAddress = result.address;
        console.log('📍 Dirección:', walletAddress);
        setAddress(walletAddress);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  const connect = async () => {
    setIsConnecting(true);
    try {
      console.log('🔄 Solicitando acceso a Freighter...');
      
      // Solicitar acceso explícito
      await requestAccess();
      
      const connected = await checkIsConnected();
      if (connected) {
        const result = await getAddress();
        const walletAddress = result.address;
        setAddress(walletAddress);
        setIsConnected(true);
        return walletAddress;
      }
    } catch (error) {
      console.error('❌ Error conectando:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const sign = async (xdr: string, opts?: { networkPassphrase?: string }) => {
    try {
      const networkPassphrase = opts?.networkPassphrase || "Test SDF Network ; September 2015";
      console.log("[v0] Signing XDR with networkPassphrase:", networkPassphrase);
      const result = await signTransaction(xdr, {
        networkPassphrase,
      });
      return result.signedTxXdr;
    } catch (error) {
      console.error("[v0] Error signing:", error);
      throw error;
    }
  };

  return {
    address,
    isConnected,
    isConnecting,
    connect,
    signTransaction: sign,
  };
}
