/**
 * @component RfidProvider
 * @description
 * Provedor que implementa a lógica de conexão Web Serial.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { notifications } from "@mantine/notifications";
import { RfidContext } from "../context/RfidContext";

export const RfidProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastTag, setLastTag] = useState<string | null>(null);

  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const keepReading = useRef(false);

  const processLine = (line: string) => {
    try {
      const clean = line.trim();
      if (!clean.startsWith("{")) return;
      const data = JSON.parse(clean);
      if (data.tag) {
        setLastTag(data.tag);
        notifications.show({
          title: "Tag Lida",
          message: data.tag,
          color: "blue",
          autoClose: 2000,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      /* ignore */
    }
  };

  const readSerialLoop = async () => {
    while (portRef.current?.readable && keepReading.current) {
      const textDecoder = new TextDecoderStream();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _readableStreamClosed = portRef.current.readable.pipeTo(
        textDecoder.writable
      );
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
      notifications.show({
        title: "Desconectado",
        message: "Leitor RFID desconectado.",
        color: "gray",
      });
    }
  };

  const connect = async () => {
    if (!("serial" in navigator)) {
      notifications.show({
        title: "Erro",
        message: "Navegador sem suporte a Web Serial.",
        color: "red",
      });
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
      notifications.show({
        title: "Erro",
        message: "Falha ao conectar na porta USB.",
        color: "red",
      });
    }
  };

  const disconnect = async () => {
    keepReading.current = false;
    if (readerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      try {
        await readerRef.current.cancel();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        /* ignore */
      }
    }
  };

  const clearTag = () => setLastTag(null);

  useEffect(() => {
    return () => {
      keepReading.current = false;
    };
  }, []);

  return (
    <RfidContext.Provider
      value={{ connect, disconnect, isConnected, lastTag, clearTag }}
    >
      {children}
    </RfidContext.Provider>
  );
};
