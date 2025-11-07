/**
 * @component RfidConfigView
 * @description
 * Tela para configuração e teste dos leitores RFID.
 * Permite selecionar a porta de conexão e realizar um teste real
 * de leitura chamando o backend para simular a entrada de uma tag.
 */
import {
  Box, Title, Paper, Select, Button, Slider, NumberInput,
  Stack, Group, Text, Alert, TextInput
} from "@mantine/core";
import { IconCheck, IconExclamationCircle, IconNfc } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { apiService } from "../services/api";

export function RfidConfigView() {
  const [connected, setConnected] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error', message: string } | null>(null);

  const configForm = useForm({
    initialValues: {
      port: "",
      signal: 50,
      interval: 500,
      testTag: "A1B2C3D4",
    },
  });

  const handleToggleConnection = () => {
    setConnected((c) => !c);
    if (!connected) {
      notifications.show({ title: 'Conectado!', message: `Leitor na porta ${configForm.values.port || 'USB'} pronto.`, color: 'green', icon: <IconCheck /> });
    } else {
      notifications.show({ title: 'Desconectado', message: 'Leitor RFID desconectado.', color: 'gray' });
    }
  };

  const handleTestRead = async () => {
    setTestResult(null);
    setTesting(true);

    try {
      const response = await apiService.simulateRfidScan(configForm.values.testTag);

      setTestResult({
        status: 'success',
        message: response.message || `Leitura bem-sucedida! Tag: ${response.rfidTag}`
      });
      notifications.show({ title: 'Sucesso', message: 'Leitura RFID processada pelo backend.', color: 'green', icon: <IconCheck /> });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setTestResult({
        status: 'error',
        message: error.message || 'Falha na leitura da tag.'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box>
      <Title order={2} c="orange.7" mb="lg">Configuração do Leitor RFID</Title>

      <Paper p="md" withBorder shadow="md" radius="md" style={{ maxWidth: 600 }}>
        <Stack gap="md">
          <Select
            label="Selecionar Porta"
            placeholder="Escolha uma porta ou digite um IP"
            searchable
            data={[{ value: "COM3", label: "COM3" }, { value: "192.168.1.100", label: "192.168.1.100" }]}
            {...configForm.getInputProps("port")}
          />

          <Button fullWidth color={connected ? "red" : "orange"} onClick={handleToggleConnection}>
            {connected ? "Desconectar" : "Conectar"}
          </Button>

          <Stack gap="md" style={{ opacity: connected ? 1 : 0.5, pointerEvents: connected ? 'all' : 'none', transition: 'opacity 0.3s ease' }}>
            <div>
              <Group justify="space-between" mb="sm">
                <Text fw={500} size="sm">Potência do Sinal</Text>
                <Text c="dimmed" size="sm">{configForm.values.signal}%</Text>
              </Group>
              <Slider color="orange" {...configForm.getInputProps("signal")} min={0} max={100} />
            </div>

            <NumberInput label="Intervalo de Leitura (ms)" min={100} step={50} {...configForm.getInputProps("interval")} />

            <Text fw={500} size="sm" mt="md">Teste de Leitura Manual</Text>
            <Group align="flex-end">
               <TextInput
                  label="Tag para Simulação"
                  description="Digite uma tag que exista no banco para testar"
                  placeholder="Ex: A1B2C3D4"
                  style={{ flex: 1 }}
                  rightSection={<IconNfc size={16} style={{ opacity: 0.5 }} />}
                  {...configForm.getInputProps("testTag")}
               />
               <Button variant="filled" color="blue" onClick={handleTestRead} loading={testing}>
                 Testar Leitura
               </Button>
            </Group>

            {testResult && (
              <Alert
                variant="light"
                color={testResult.status === 'success' ? 'green' : 'red'}
                title={testResult.status === 'success' ? 'Leitura Confirmada' : 'Falha na Leitura'}
                icon={testResult.status === 'success' ? <IconCheck /> : <IconExclamationCircle />}
                withCloseButton
                onClose={() => setTestResult(null)}
                mt="sm"
              >
                {testResult.message}
              </Alert>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}