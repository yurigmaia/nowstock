/**
 * @component ProductModal
 * @description
 * Modal de "casca" que controla a exibição e o estado de submissão
 * do formulário de produto (ProductForm).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal } from '@mantine/core';
// Corrigido: O formulário está na mesma pasta, dentro de /components/products
import { ProductForm } from './ProductForm'; 
import type { Product } from '../../types/entities';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { apiService } from '../../services/api'; // Importa o serviço de API real

interface ProductModalProps {
  opened: boolean;
  onClose: () => void;
  product: Product | null;
  onSaveSuccess: () => void;
}

export function ProductModal({ opened, onClose, product, onSaveSuccess }: ProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const title = product ? 'Editar Produto' : 'Adicionar Novo Produto';

  const handleFormSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    // O 'values' já vem do formulário no formato snake_case (ex: id_categoria)
    // graças ao nosso ProductForm.tsx
    
    try {
      if (product) {
        // Modo Edição: Chama o updateProduct
        await apiService.updateProduct(product.id_produto, values);
        notifications.show({
            title: 'Sucesso!',
            message: 'Produto atualizado com sucesso.',
            color: 'green',
          });
      } else {
        // Modo Criação: Chama o createProduct
        await apiService.createProduct(values);
        notifications.show({
            title: 'Sucesso!',
            message: 'Produto criado com sucesso.',
            color: 'green',
          });
      }
      onSaveSuccess(); // Recarrega a tabela na tela principal
      onClose(); // Fecha o modal
    
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      notifications.show({
        title: 'Erro ao Salvar',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="lg" centered>
      <ProductForm
        product={product}
        onSubmit={handleFormSubmit}
        onCancel={onClose}
        loading={isSubmitting}
      />
    </Modal>
  );
}