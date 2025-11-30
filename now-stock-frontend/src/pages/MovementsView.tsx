/**
 * @component MovementsView
 * @description
 * Tela unificada para registro de movimentações.
 * Integração RFID: Ao ler uma tag, seleciona o produto automaticamente.
 */
import {
  Box, Title, Paper, Select, SegmentedControl, NumberInput, Textarea, Button, Stack, TextInput, Group
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX, IconNfc } from "@tabler/icons-react";

import { useAuth } from '../hooks/useAuth';
import { apiService } from "../services/api";
import type { Product } from "../types/entities";
import { useRfid } from "../hooks/useRfid";
import { useTranslation } from "react-i18next";

type MovementFlow = 'entrada' | 'saida' | 'devolucao';

export function MovementsView() {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useAuth() as any;
  const { lastTag, clearTag } = useRfid();
  
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState<{ value: string; label: string }[]>([]);
  const [rawProducts, setRawProducts] = useState<Product[]>([]); 
  const [movementType, setMovementType] = useState<MovementFlow>('entrada');

  useEffect(() => {
    apiService.getProducts().then((products: Product[]) => {
      setRawProducts(products);
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
      user: user?.nome || t('movements.unknownUser'),
      date: new Date().toISOString().split("T")[0],
    },
    validate: {
      productId: (value) => (value ? null : t('movements.validation.productRequired')),
      quantity: (value) => (value > 0 ? null : t('movements.validation.qtyPositive')),
      reason: (value) => 
        (movementType === 'devolucao' && !value.trim()) ? t('movements.validation.reasonRequired') : null,
    }
  });

  useEffect(() => {
    if (lastTag) {
      form.setFieldValue('rfidTag', lastTag);

      const foundProduct = rawProducts.find(p => p.etiqueta_rfid === lastTag);

      if (foundProduct) {
        form.setFieldValue('productId', String(foundProduct.id_produto));
        
        notifications.show({ 
          title: t('movements.notifications.identifiedTitle'), 
          message: t('movements.notifications.identifiedMessage', { product: foundProduct.nome }), 
          color: 'green',
          icon: <IconCheck size={16}/>
        });
      } else {
        notifications.show({ 
          title: t('movements.notifications.unknownTagTitle'), 
          message: t('movements.notifications.unknownTagMessage'), 
          color: 'yellow',
          icon: <IconNfc size={16}/>
        });
      }
      
      clearTag();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTag, rawProducts]);

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

      const typeLabel = t(`movements.types.${movementType}`);
      
      notifications.show({
        title: t('common.success'),
        message: t('movements.notifications.success', { type: typeLabel }),
        color: 'green',
        icon: <IconCheck />,
      });
      form.reset();
      form.setFieldValue('date', new Date().toISOString().split("T")[0]);
      if(user) form.setFieldValue('user', user.nome);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('common.unknownError');
      notifications.show({
        title: t('common.error'),
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
      <Title order={2} c="orange.7" mb="lg">{t('movements.title')}</Title>

      <Paper p="md" withBorder shadow="md" radius="md" style={{ maxWidth: 600 }}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <SegmentedControl
              value={movementType}
              onChange={(value: string) => setMovementType(value as MovementFlow)}
              data={[
                { value: "entrada", label: t('movements.types.entrada') },
                { value: "saida", label: t('movements.types.saida') },
                { value: "devolucao", label: t('movements.types.devolucao') },
              ]}
              color="orange"
              fullWidth
            />

            <TextInput
              label={t('movements.form.rfid')}
              placeholder={t('movements.form.rfidPlaceholder')}
              description={t('movements.form.rfidDescription')}
              rightSection={<IconNfc size={16} style={{ opacity: 0.5 }} />}
              {...form.getInputProps("rfidTag")}
            />
            
            <Select
              label={t('movements.form.product')}
              placeholder={t('movements.form.productPlaceholder')}
              searchable
              required
              data={productList}
              {...form.getInputProps("productId")}
            />
            
            <NumberInput 
              label={t('movements.form.quantity')} 
              placeholder="1" 
              min={1} 
              required 
              {...form.getInputProps("quantity")} 
            />

            {movementType !== 'devolucao' && (
              <Select 
                label={t('movements.form.unit')} 
                data={[
                  { value: "unidade", label: t('movements.units.unit') }, 
                  { value: "lote", label: t('movements.units.lot') }
                ]} 
                required 
                {...form.getInputProps("unit")} 
              />
            )}

            {movementType === 'devolucao' && (
              <>
                <Textarea 
                  label={t('movements.form.reason')} 
                  placeholder={t('movements.form.reasonPlaceholder')} 
                  required 
                  {...form.getInputProps("reason")} 
                />
                <Select 
                  label={t('movements.form.destination')} 
                  data={[
                    { value: "estoque", label: t('movements.destinations.stock') }, 
                    { value: "descarte", label: t('movements.destinations.discard') }
                  ]} 
                  required 
                  {...form.getInputProps("state")} 
                />
              </>
            )}

            <TextInput 
              label={t('movements.form.user')} 
              disabled 
              {...form.getInputProps("user")} 
            />
            <TextInput 
              label={t('movements.form.date')} 
              type="date" 
              disabled 
              {...form.getInputProps("date")} 
            />

            <Group justify="flex-end" mt="md">
              <Button fullWidth bg="orange.6" type="submit" loading={loading}>
                {t('movements.form.submit')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}