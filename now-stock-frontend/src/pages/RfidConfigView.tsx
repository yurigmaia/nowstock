/**
 * @component RfidConfigView
 * @description
 * Tela para configuração e teste dos leitores RFID.
 * Permite ao usuário selecionar uma porta (USB ou IP), conectar/desconectar,
 * ajustar parâmetros como potência e intervalo, e realizar testes de leitura.
 * Atualmente, as conexões e testes são simulados.
 */
import {
  Box,
  Title,
  Paper,
  Select,
  Button,
  Slider,
  NumberInput,
  Stack,
  Group,
  Text,
  Alert,
} from "@mantine/core";
import { IconCheck, IconExclamationCircle } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

export function RfidConfigView() {
  const [connected, setConnected] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error', message: string } | null>(null);

  const configForm = useForm({
    initialValues: {
      port: "",
      signal: 50,
      interval: 500,
    },
  });

  const handleToggleConnection = () => {
    setConnected((c) => !c);
    if (!connected) {
      notifications.show({
        title: 'Conectado!',
        message: `Leitor na porta ${configForm.values.port || 'USB'} pronto.`,
        color: 'green',
        icon: <IconCheck />,
      });
    } else {
      notifications.show({
        title: 'Desconectado',
        message: 'Leitor RFID desconectado.',
        color: 'gray',
      });
    }
  };

  const handleTestRead = () => {
    console.log("Testando leitura RFID...");
    setTestResult(null);
    notifications.show({
      title: 'Testando...',
      message: 'Aproxime uma tag do leitor...',
      color: 'blue',
      loading: true,
    });

    setTimeout(() => {
      if (Math.random() > 0.3) {
        setTestResult({ status: 'success', message: 'Tag lida com sucesso! ID: A1B2C3D4' });
      } else {
        setTestResult({ status: 'error', message: 'Nenhuma tag encontrada. Verifique a conexão.' });
      }
    }, 1500);
  };

  return (
    <Box>
      <Title order={2} c="orange.7" mb="lg">
        Configuração do Leitor RFID
      </Title>

      <Paper p="md" withBorder shadow="md" radius="md" style={{ maxWidth: 600 }}>
        <Stack gap="md">
          <Select
            label="Selecionar Porta"
            placeholder="Escolha uma porta ou digite um IP"
            searchable
            data={[
              { value: "COM3", label: "COM3" },
              { value: "192.168.1.100", label: "192.168.1.100" },
            ]}
            {...configForm.getInputProps("port")}
          />

          <Button 
            fullWidth 
            color={connected ? "red" : "orange"} 
            onClick={handleToggleConnection}
          >
            {connected ? "Desconectar" : "Conectar"}
          </Button>

          <Stack gap="md" style={{ opacity: connected ? 1 : 0.4, pointerEvents: connected ? 'all' : 'none' }}>
            <div>
              <Group justify="space-between" mb="sm">
                <Text fw={500} size="sm">Potência do Sinal</Text>
                <Text c="dimmed" size="sm">
                  {configForm.values.signal}%
                </Text>
              </Group>
              <Slider 
                color="orange"
                {...configForm.getInputProps("signal")}
                min={0} max={100} 
              />
            </div>

            <NumberInput
              label="Intervalo de Leitura (ms)"
              placeholder="Ex: 500"
              min={100}
              step={50}
              {...configForm.getInputProps("interval")}
            />

            <Button variant="default" fullWidth onClick={handleTestRead}>
              Testar Leitura
            </Button>

            {testResult && (
              <Alert
                color={testResult.status === 'success' ? 'green' : 'red'}
                icon={testResult.status === 'success' ? <IconCheck /> : <IconExclamationCircle />}
                onClose={() => setTestResult(null)}
                withCloseButton
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