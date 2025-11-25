/**
 * @component RfidConfigView
 * @description
 * Tela para gerenciar a conexão com o hardware.
 */
import { Box, Title, Paper, Button, Stack, Text, Group } from "@mantine/core";
import { IconUsb } from "@tabler/icons-react";
import { useRfid } from "../hooks/useRfid"; // Usa o Hook Global

export function RfidConfigView() {
  const { connect, disconnect, isConnected, lastTag } = useRfid();

  return (
    <Box>
      <Title order={2} c="orange.7" mb="lg">Conexão RFID (USB)</Title>
      <Paper p="xl" withBorder shadow="md" radius="md" maw={600}>
        <Stack gap="lg" align="center">
          <div style={{ 
              padding: 20, borderRadius: '50%', 
              border: `2px solid ${isConnected ? 'green' : 'gray'}`,
              background: isConnected ? 'rgba(0,255,0,0.1)' : 'transparent'
            }}>
            <IconUsb size={48} color={isConnected ? 'green' : 'gray'} />
          </div>
          
          <Text size="lg" fw={500}>{isConnected ? "Conectado" : "Desconectado"}</Text>
          
          {!isConnected ? (
             <Button fullWidth bg="orange.6" onClick={connect}>Conectar USB</Button>
          ) : (
             <Button fullWidth color="red" variant="light" onClick={disconnect}>Desconectar</Button>
          )}

          {lastTag && (
             <Group>
                <Text>Última leitura:</Text>
                <Text fw={700} c="orange">{lastTag}</Text>
             </Group>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}