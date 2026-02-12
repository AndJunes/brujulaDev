"use client";

import { useEffect, useState } from "react";
import { isConnected, getAddress, requestAccess } from "@stellar/freighter-api";

export default function TestFreighter() {
  const [status, setStatus] = useState("Probando...");
  const [address, setAddress] = useState("");

  useEffect(() => {
    testFreighter();
  }, []);

  const testFreighter = async () => {
    try {
      setStatus("1. Verificando si Freighter está disponible...");
      console.log("window.freighter:", window.freighter);
      
      setStatus("2. Llamando a isConnected()...");
      const connected = await isConnected();
      console.log("isConnected:", connected);
      
      if (connected) {
        setStatus("3. Obteniendo address...");
        const { address } = await getAddress();
        setAddress(address);
        setStatus("✅ Conectado!");
      } else {
        setStatus("4. Solicitando acceso...");
        await requestAccess();
        setStatus("✅ Acceso concedido, recarga la página");
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🧪 Test Freighter</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="mb-2">📌 Estado: {status}</p>
        {address && (
          <p className="text-green-600 font-mono">
            ✅ Wallet: {address}
          </p>
        )}
      </div>
    </div>
  );
}