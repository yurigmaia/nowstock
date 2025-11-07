/**
 * @component MovementsView
 * @description
 * Tela unificada para registro de movimentações de estoque (Entrada, Saída e Devolução).
 * Permite a seleção de produtos, definição de quantidades e justificativas,
 * e exibe campos dinamicamente com base no tipo de movimentação.
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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

import { useAuth } from '../hooks/useAuth';
import { apiService } from "../services/api";
import type { Product } from "../types/entities";

type MovementFlow = 'entrada' | 'saida' | 'devolucao';

export function MovementsView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState<{ value: string; label: string }[]>([]);
  const [movementType, setMovementType] = useState<MovementFlow>('entrada');

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
      productId: "",
      rfidTag: "",
      quantity: 1,
      unit: "unidade",
      reason: "",
      state: "estoque",
      user: user?.nome || "Usuário Desconhecido",
      date: new Date().toISOString().split("T")[0],
    },
    validate: {
      productId: (value) => (value ? null : "Selecione um produto"),
      quantity: (value) => (value > 0 ? null : "A quantidade deve ser maior que zero"),
      reason: (value) => 
        (movementType === 'devolucao' && !value.trim()) ? "O motivo é obrigatório para devoluções" : null,
    }
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const payload = {
        movementType: movementType,
        id_produto: values.productId,
        etiqueta_rfid: values.rfidTag,
        quantidade: values.quantity,
        unidade: values.unit,
        justificativa: values.reason,
        estado: values.state,
        id_usuario: user?.id,
      };

      await apiService.createMovement(payload);

      notifications.show({
        title: "Sucesso!",
        message: `Movimentação (${movementType}) registrada.`,
        color: 'green',
        icon: <IconCheck />,
      });
      form.reset();
      form.setFieldValue('date', new Date().toISOString().split("T")[0]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      notifications.show({
        title: 'Erro',
        message: errorMessage,
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
        Registrar Movimentação
      </Title>

      <Paper p="md" withBorder shadow="md" radius="md" style={{ maxWidth: 600 }}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <SegmentedControl
              value={movementType}
              onChange={(value: string) => setMovementType(value as MovementFlow)}
              data={[
                { value: "entrada", label: "Entrada" },
                { value: "saida", label: "Saída" },
                { value: "devolucao", label: "Devolução" },
              ]}
              color="orange"
              fullWidth
            />

            <TextInput
              label="Etiqueta RFID"
              placeholder="Aproxime a tag do leitor..."
              {...form.getInputProps("rfidTag")}
            />
            
            <Select
              label="Produto (Seleção Manual)"
              placeholder="Ou selecione um produto da lista..."
              searchable
              required
              data={productList}
              {...form.getInputProps("productId")}
            />
            
            <NumberInput
              label="Quantidade"
              placeholder="1"
              min={1}
              required
              {...form.getInputProps("quantity")}
            />

            {movementType !== 'devolucao' && (
              <Select
                label="Unidade"
                data={[
                  { value: "unidade", label: "Unidade" },
                  { value: "lote", label: "Lote" },
                ]}
                required
                {...form.getInputProps("unit")}
              />
            )}

            {movementType === 'devolucao' && (
              <>
                <Textarea
                  label="Motivo da Devolução"
                  placeholder="Ex: Produto com defeito, cliente arrependeu-se..."
                  required
                  {...form.getInputProps("reason")}
                />
                <Select
                  label="Destino da Devolução"
                  data={[
                    { value: "estoque", label: "Retornar ao Estoque" },
                    { value: "descarte", label: "Descartar Produto" },
                  ]}
                  required
                  {...form.getInputProps("state")}
                />
              </>
            )}

            <TextInput
              label="Usuário"
              disabled
              {...form.getInputProps("user")}
            />
            <TextInput
              label="Data da Movimentação"
              type="date"
              disabled
              {...form.getInputProps("date")}
            />

            <Group justify="flex-end" mt="md">
              <Button 
                fullWidth 
                bg="orange.6" 
                type="submit" 
                loading={loading}
              >
                Registrar Movimentação
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}