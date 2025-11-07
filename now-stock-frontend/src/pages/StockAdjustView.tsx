/**
 * @component StockAdjustView
 * @description
 * Tela para registro de ajustes manuais de estoque (Entrada/Saída).
 * Permite ao usuário logado selecionar um produto, definir a quantidade
 * do ajuste e fornecer uma justificativa obrigatória.
 */
import {
  Box,
  Title,
  Paper,
  Select,
  SegmentedControl,
  NumberInput,
  Textarea,
  Button,
  Stack,
  TextInput,
  Group,
  // Center, // Removido
  // Loader, // Removido
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

import { useAuth } from '../hooks/useAuth';
import { apiService } from "../services/api";
import type { Product } from "../types/entities";

// O tipo de movimentação para esta tela é 'entrada' ou 'saida'
type AdjustFlow = 'entrada' | 'saida';

export function StockAdjustView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    apiService.getProducts().then((products: Product[]) => {
      const formattedProducts = products.map(p => ({
        value: String(p.id_produto),
        label: `${p.nome} (Tag: ${p.etiqueta_rfid})`,
      }));
      setProductList(formattedProducts);
    });
  }, []);

  const form = useForm({
    initialValues: {
      id_produto: "",
      tipo: "entrada" as AdjustFlow,
      quantidade: 1,
      justificativa: "",
      usuario: user?.nome || "Usuário Desconhecido",
      data: new Date().toISOString().split("T")[0],
    },
    validate: {
      id_produto: (value) => (value ? null : "Selecione um produto"),
      quantidade: (value) => (value > 0 ? null : "A quantidade deve ser maior que zero"),
      justificativa: (value) => (value.trim().length > 0 ? null : "A justificativa é obrigatória"),
    }
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const payload = {
        movementType: values.tipo,
        id_produto: values.id_produto,
        etiqueta_rfid: null,
        quantidade: values.quantidade,
        unidade: "unidade",
        justificativa: values.justificativa,
        estado: "estoque",
        id_usuario: user?.id,
      };

      await apiService.createMovement(payload);

      notifications.show({
        title: "Sucesso!",
        message: "Ajuste de estoque registrado.",
        color: 'green',
        icon: <IconCheck />,
      });
      form.reset();
      form.setFieldValue('data', new Date().toISOString().split("T")[0]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      notifications.show({
        title: 'Erro',
        message: error.message || "Não foi possível registrar o ajuste.",
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Title order={2} c="orange.7" mb="lg">
        Ajuste Manual de Estoque
      </Title>

      <Paper p="md" withBorder shadow="md" radius="md" style={{ maxWidth: 600 }}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <SegmentedControl
              {...form.getInputProps("tipo")}
              data={[
                { value: "entrada", label: "Entrada" },
                { value: "saida", label: "Saída" },
              ]}
              color="orange"
              fullWidth
            />
            
            <Select
              label="Produto"
              placeholder="Selecione um produto..."
              searchable
              required
              data={productList}
              {...form.getInputProps("id_produto")}
            />

            <NumberInput
              label="Quantidade"
              placeholder="0"
              min={1}
              required
              {...form.getInputProps("quantidade")}
            />

            <TextInput
              label="Usuário"
              disabled
              {...form.getInputProps("usuario")}
            />

            <TextInput
              label="Data da Movimentação"
              type="date"
              disabled
              {...form.getInputProps("data")}
            />

            <Textarea
              label="Justificativa"
              placeholder="Ex: Contagem de inventário, produto danificado..."
              required
              minRows={3}
              {...form.getInputProps("justificativa")}
            />

            <Group justify="flex-end" mt="md">
              <Button 
                fullWidth 
                bg="orange.6" 
                type="submit" 
                loading={loading}
              >
                Registrar Ajuste
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}