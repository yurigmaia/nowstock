/**
 * @component AdminView
 * @description
 * Tela de administração do sistema, acessível apenas por usuários 'admin'.
 * Permite a gestão de configurações gerais da empresa, parâmetros do sistema
 * (como backups e alertas) e a visualização de logs de atividade.
 * Os dados são apresentados em abas (Tabs) para melhor organização.
 */
import { Box, Title, Tabs, Paper, TextInput, Select, Button, Stack, Group, Table } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useEffect } from "react";

interface LogEntry {
  user: string;
  action: string;
  date: string;
}

export function AdminView() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const mockLogs = [
      { user: "Yuri Maia", action: "Login", date: "2025-11-03 08:00" },
      { user: "Lívia", action: "Criou Produto: Mouse Gamer", date: "2025-11-03 08:15" },
      { user: "Vitor", action: "Recebimento RFID: A1B2C3D4", date: "2025-11-03 08:30" },
      { user: "Yuri Maia", action: "Backup Manual Executado", date: "2025-11-03 09:00" },
    ];
    setLogs(mockLogs);
  }, []);

  const generalForm = useForm({
    initialValues: {
      storeName: "NowStock",
      cnpj: "12345678000190",
    },
  });

  const systemForm = useForm({
    initialValues: {
      backupInterval: "diario",
      alertEmail: "admin@nowstock.com",
    },
  });

  const logRows = logs.map((log, idx) => (
    <Table.Tr key={idx}>
      <Table.Td>{log.user}</Table.Td>
      <Table.Td>{log.action}</Table.Td>
      <Table.Td>{log.date}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>
      <Title order={2} c="orange.7" mb="lg">
        Administração do Sistema
      </Title>

      <Paper p="md" withBorder shadow="md" radius="md">
        <Tabs defaultValue="general">
          <Tabs.List>
            <Tabs.Tab value="general">Configurações Gerais</Tabs.Tab>
            <Tabs.Tab value="system">Parâmetros do Sistema</Tabs.Tab>
            <Tabs.Tab value="logs">Logs do Sistema</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general" pt="lg">
            <form onSubmit={generalForm.onSubmit((values) => console.log(values))}>
              <Stack gap="md" maw={500}>
                <TextInput
                  label="Nome da Loja"
                  {...generalForm.getInputProps("storeName")}
                />
                <TextInput 
                  label="CNPJ" 
                  {...generalForm.getInputProps("cnpj")} 
                />
                <Button bg="orange.6" type="submit" mt="md" style={{ alignSelf: 'flex-start' }}>
                  Salvar
                </Button>
              </Stack>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="system" pt="lg">
            <form onSubmit={systemForm.onSubmit((values) => console.log(values))}>
              <Stack gap="md" maw={500}>
                <Select
                  label="Intervalo de Backup"
                  data={[
                    { value: "diario", label: "Diário" },
                    { value: "semanal", label: "Semanal" },
                    { value: "mensal", label: "Mensal" },
                  ]}
                  {...systemForm.getInputProps("backupInterval")}
                />
                <TextInput
                  label="E-mail para Alertas de Estoque"
                  {...systemForm.getInputProps("alertEmail")}
                />
                <Group gap="md" mt="md">
                  <Button bg="orange.6" type="submit">
                    Salvar Parâmetros
                  </Button>
                  <Button variant="default">Executar Backup Manual Agora</Button>
                </Group>
              </Stack>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="logs" pt="lg">
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Usuário</Table.Th>
                  <Table.Th>Ação Realizada</Table.Th>
                  <Table.Th>Data do Log</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{logRows}</Table.Tbody>
            </Table>
          </Tabs.Panel> 
        </Tabs>
      </Paper> 
    </Box>
  );
}