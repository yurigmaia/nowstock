/**
 * @context RfidContext
 * @description
 * Gerencia a conexão Web Serial (USB) com o leitor RFID globalmente.
 * Mantém a porta aberta enquanto o usuário navega pelo sistema e
 * distribui o último código de tag lido para qualquer componente que precise.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useState, useRef, useEffect, ReactNode } from 'react';
import { notifications } from '@mantine/notifications';

interface RfidContextType {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  lastTag: string | null;     // A última tag lida (para preencher inputs)
  clearTag: () => void;       // Para limpar a tag depois de usada
}

export const RfidContext = createContext<RfidContextType | null>(null);

export const RfidProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastTag, setLastTag] = useState<string | null>(null);
  
  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const keepReading = useRef(false);

  const connect = async () => {
    if (!("serial" in navigator)) {
      notifications.show({ title: 'Erro', message: 'Navegador sem suporte a Web Serial.', color: 'red' });
      return;
    }
    if (portRef.current) return;

    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      
      portRef.current = port;
      keepReading.current = true;
      setIsConnected(true);
      
      readSerialLoop();
      
    } catch (err) {
      console.error("Erro serial:", err);
      notifications.show({ title: 'Erro', message: 'Falha ao conectar na porta USB.', color: 'red' });
    }
  };

  const disconnect = async () => {
    keepReading.current = false;
    if (readerRef.current) {
      try { await readerRef.current.cancel(); } catch (e) { /* ignore */ }
    }
    // O fechamento real ocorre no finally do loop
  };

  const readSerialLoop = async () => {
    while (portRef.current?.readable && keepReading.current) {
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = portRef.current.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;
      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            buffer += value;
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) processLine(line);
          }
        }
      } catch (error) {
        console.error("Erro leitura:", error);
        break;
      } finally {
        reader.releaseLock();
      }
    }
    
    if (portRef.current) {
      await portRef.current.close();
      portRef.current = null;
      setIsConnected(false);
      notifications.show({ title: 'Desconectado', message: 'Leitor RFID desconectado.', color: 'gray' });
    }
  };

  const processLine = (line: string) => {
    try {
      const clean = line.trim();
      if (!clean.startsWith('{')) return;
      const data = JSON.parse(clean);
      if (data.tag) {
        // Atualiza o estado global com a nova tag
        setLastTag(data.tag);
        // Notificação visual rápida
        notifications.show({ title: 'Tag Lida', message: data.tag, color: 'blue', autoClose: 2000 });
      }
    } catch (e) { /* ignore */ }
  };

  const clearTag = () => setLastTag(null);

  // Garante desconexão ao fechar a aba/app
  useEffect(() => {
    return () => { keepReading.current = false; };
  }, []);

  return (
    <RfidContext.Provider value={{ connect, disconnect, isConnected, lastTag, clearTag }}>
      {children}
    </RfidContext.Provider>
  );
};