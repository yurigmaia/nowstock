/**
 * @component ProductForm
 * @description
 * Formulário reutilizável para criar ou editar um produto.
 * Busca dinamicamente categorias e fornecedores do 'apiService'.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Textarea, NumberInput, Select, Button, Group, SimpleGrid } from '@mantine/core';
import { apiService } from '../services/api';
import type { Product } from '../types/entities';

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
      quantidade_atual: product?.quantidade_atual ?? 0,
      preco_custo: product?.preco_custo ?? 0,
      preco_venda: product?.preco_venda ?? 0,
      quantidade_minima: product?.quantidade_minima ?? 0,
      localizacao: product?.localizacao || '',
    },
    validate: {
      nome: (value) => (value.trim().length < 3 ? 'Nome muito curto' : null),
      etiqueta_rfid: (value) => (value.trim().length === 0 ? 'Tag RFID é obrigatória' : null),
      id_categoria: (value) => (value === null ? 'Selecione uma categoria' : null),
      id_fornecedor: (value) => (value === null ? 'Selecione um fornecedor' : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <TextInput label="Nome do Produto" required {...form.getInputProps('nome')} />
      <Textarea label="Descrição" mt="md" {...form.getInputProps('descricao')} />
      
      <SimpleGrid cols={2} mt="md">
        <Select
          label="Categoria"
          placeholder="Selecione..."
          data={categories}
          required
          searchable
          clearable
          {...form.getInputProps('id_categoria')}
        />
        <Select
          label="Fornecedor"
          placeholder="Selecione..."
          data={suppliers}
          required
          searchable
          clearable
          {...form.getInputProps('id_fornecedor')}
        />
      </SimpleGrid>
      
      <TextInput label="Etiqueta RFID" mt="md" required {...form.getInputProps('etiqueta_rfid')} />
      <TextInput label="Localização" mt="md" {...form.getInputProps('localizacao')} />

      <SimpleGrid cols={3} mt="md">
         <NumberInput label="Qtd. Atual" required {...form.getInputProps('quantidade_atual')} min={0} />
         <NumberInput label="Qtd. Mínima" {...form.getInputProps('quantidade_minima')} min={0} />
      </SimpleGrid>
      
      <SimpleGrid cols={2} mt="md">
         <NumberInput label="Preço de Custo" prefix="R$ " decimalScale={2} fixedDecimalScale {...form.getInputProps('preco_custo')} />
         <NumberInput label="Preço de Venda" prefix="R$ " decimalScale={2} fixedDecimalScale {...form.getInputProps('preco_venda')} />
      </SimpleGrid>
      
      <Group justify="flex-end" mt="xl">
        <Button variant="default" onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button type="submit" loading={loading} bg="orange.6">Salvar Produto</Button>
      </Group>
    </form>
  );
}