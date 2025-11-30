/**
 * @component ProductForm
 * @description
 * Formulário para criar/editar produtos.
 * Integração com useRfid para preenchimento automático da tag.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Textarea, NumberInput, Select, Button, Group, SimpleGrid } from '@mantine/core';
import { apiService } from '../../services/api';
import type { Product } from '../../types/entities';
import { useRfid } from '../../hooks/useRfid';
import { notifications } from '@mantine/notifications';
import { IconNfc } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const formatIdToString = (id: number | undefined | null): string | null => {
  return id != null ? String(id) : null;
};

export function ProductForm({ product, onSubmit, onCancel, loading }: ProductFormProps) {
  const { t } = useTranslation();
  const { lastTag, clearTag } = useRfid();
  
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    apiService.getCategories().then(data =>
      setCategories(data.map(cat => ({ value: String(cat.id_categoria), label: cat.nome })))
    );
    apiService.getSuppliers().then(data =>
      setSuppliers(data.map(sup => ({ value: String(sup.id_fornecedor), label: sup.nome })))
    );
  }, []);

  const form = useForm({
    initialValues: {
      nome: product?.nome || '',
      descricao: product?.descricao || '',
      etiqueta_rfid: product?.etiqueta_rfid || '',
      id_categoria: formatIdToString(product?.id_categoria),
      id_fornecedor: formatIdToString(product?.id_fornecedor),
      preco_custo: product?.preco_custo ?? 0,
      preco_venda: product?.preco_venda ?? 0,
      quantidade_minima: product?.quantidade_minima ?? 0,
      localizacao: product?.localizacao || '',
    },
    validate: {
      nome: (value) => (value.trim().length < 3 ? t('products.form.errors.nameShort') : null),
      etiqueta_rfid: (value) => (value.trim().length === 0 ? t('products.form.errors.rfidRequired') : null),
      id_categoria: (value) => (value === null ? t('products.form.errors.categoryRequired') : null),
      id_fornecedor: (value) => (value === null ? t('products.form.errors.supplierRequired') : null),
    },
  });

  useEffect(() => {
    if (lastTag) {
      form.setFieldValue('etiqueta_rfid', lastTag);
      
      notifications.show({ 
        title: t('products.rfid.capturedTitle'), 
        message: t('products.rfid.capturedMessage', { tag: lastTag }), 
        color: 'blue',
        icon: <IconNfc size={16}/>
      });
      
      clearTag();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTag]);

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <TextInput 
        label={t('products.form.name')} 
        required 
        {...form.getInputProps('nome')} 
      />
      
      <Textarea 
        label={t('products.form.description')} 
        mt="md" 
        {...form.getInputProps('descricao')} 
      />
      
      <SimpleGrid cols={2} mt="md">
        <Select
          label={t('products.form.category')}
          placeholder={t('common.select')}
          data={categories}
          required
          searchable
          clearable
          {...form.getInputProps('id_categoria')}
        />
        <Select
          label={t('products.form.supplier')}
          placeholder={t('common.select')}
          data={suppliers}
          required
          searchable
          clearable
          {...form.getInputProps('id_fornecedor')}
        />
      </SimpleGrid>
      
      <TextInput 
        label={t('products.form.rfid')} 
        description={t('products.form.rfidHelp')}
        rightSection={<IconNfc size={16} style={{ opacity: 0.5 }} />}
        mt="md" 
        required 
        {...form.getInputProps('etiqueta_rfid')} 
      />
      
      <TextInput 
        label={t('products.form.location')} 
        mt="md" 
        {...form.getInputProps('localizacao')} 
      />

      <SimpleGrid cols={3} mt="md">
         <NumberInput 
            label={t('products.form.minQty')} 
            {...form.getInputProps('quantidade_minima')} 
            min={0} 
         />
         <NumberInput 
            label={t('products.form.costPrice')} 
            prefix={t('common.currencySymbol')} 
            decimalScale={2} 
            fixedDecimalScale 
            {...form.getInputProps('preco_custo')} 
         />
         <NumberInput 
            label={t('products.form.salePrice')} 
            prefix={t('common.currencySymbol')} 
            decimalScale={2} 
            fixedDecimalScale 
            {...form.getInputProps('preco_venda')} 
         />
      </SimpleGrid>
      
      <Group justify="flex-end" mt="xl">
        <Button variant="default" onClick={onCancel} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={loading} bg="orange.6">
          {t('products.form.save')}
        </Button>
      </Group>
    </form>
  );
}