/**
 * @component StockAdjustView
 * @description
 * Tela para registro de ajustes manuais de estoque (Entrada/Saída).
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
import { useTranslation } from "react-i18next";

type AdjustFlow = 'entrada' | 'saida';

export function StockAdjustView() {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useAuth() as any;
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
      usuario: user?.nome || t('stockAdjust.unknownUser'),
      data: new Date().toISOString().split("T")[0],
    },
    validate: {
      id_produto: (value) => (value ? null : t('stockAdjust.validation.productRequired')),
      quantidade: (value) => (value > 0 ? null : t('stockAdjust.validation.qtyPositive')),
      justificativa: (value) => (value.trim().length > 0 ? null : t('stockAdjust.validation.reasonRequired')),
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
        title: t('common.success'),
        message: t('stockAdjust.messages.success'),
        color: 'green',
        icon: <IconCheck />,
      });
      form.reset();
      form.setFieldValue('data', new Date().toISOString().split("T")[0]);
      // Garante que o nome do usuário não seja apagado no reset
      if(user) form.setFieldValue('usuario', user.nome);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      notifications.show({
        title: t('common.error'),
        message: error.message || t('stockAdjust.messages.error'),
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
        {t('stockAdjust.title')}
      </Title>

      <Paper p="md" withBorder shadow="md" radius="md" style={{ maxWidth: 600 }}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <SegmentedControl
              {...form.getInputProps("tipo")}
              data={[
                { value: "entrada", label: t('stockAdjust.type.in') },
                { value: "saida", label: t('stockAdjust.type.out') },
              ]}
              color="orange"
              fullWidth
            />
            
            <Select
              label={t('stockAdjust.form.product')}
              placeholder={t('stockAdjust.form.productPlaceholder')}
              searchable
              required
              data={productList}
              {...form.getInputProps("id_produto")}
            />

            <NumberInput
              label={t('stockAdjust.form.quantity')}
              placeholder="0"
              min={1}
              required
              {...form.getInputProps("quantidade")}
            />

            <TextInput
              label={t('stockAdjust.form.user')}
              disabled
              {...form.getInputProps("usuario")}
            />

            <TextInput
              label={t('stockAdjust.form.date')}
              type="date"
              disabled
              {...form.getInputProps("data")}
            />

            <Textarea
              label={t('stockAdjust.form.reason')}
              placeholder={t('stockAdjust.form.reasonPlaceholder')}
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
                {t('stockAdjust.form.submit')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}