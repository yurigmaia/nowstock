/**
 * @component ProductModal
 * @description
 * Modal de "casca" que controla a exibição e o estado de submissão
 * do formulário de produto (ProductForm).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal } from '@mantine/core';
import { ProductForm } from './ProductForm'; 
import type { Product } from '../../types/entities';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { apiService } from '../../services/api';
import { useTranslation } from 'react-i18next';

interface ProductModalProps {
  opened: boolean;
  onClose: () => void;
  product: Product | null;
  onSaveSuccess: () => void;
}

export function ProductModal({ opened, onClose, product, onSaveSuccess }: ProductModalProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const title = product ? t('products.modal.editTitle') : t('products.modal.createTitle');

  const handleFormSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      if (product) {
        await apiService.updateProduct(product.id_produto, values);
        notifications.show({
            title: t('common.success'),
            message: t('products.messages.updated'),
            color: 'green',
          });
      } else {
        await apiService.createProduct(values);
        notifications.show({
            title: t('common.success'),
            message: t('products.messages.created'),
            color: 'green',
          });
      }
      onSaveSuccess();
      onClose();
    
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('common.unknownError');
      notifications.show({
        title: t('products.errors.saveTitle'),
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