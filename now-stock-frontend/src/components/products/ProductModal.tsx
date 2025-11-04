/**
 * @component ProductModal
 * @description
 * Modal de "casca" que controla a exibição e o estado de submissão
 * do formulário de produto (ProductForm).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal } from '@mantine/core';
import { ProductForm } from '../../pages/ProductForm.tsx';
import type { Product } from '../../types/entities';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

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
    console.log("Simulando salvamento:", values);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      notifications.show({
          title: 'Sucesso!',
          message: `Produto ${product ? 'atualizado' : 'criado'} com sucesso.`,
          color: 'green',
        });
      onSaveSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      notifications.show({
        title: 'Erro',
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