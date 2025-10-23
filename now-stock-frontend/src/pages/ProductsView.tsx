/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Table,
  Title,
  Container,
  Loader,
  Alert,
  Text,
  Paper,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import type { Product } from "../types/product";

const API_URL = "http://localhost:8000/api/products";

export function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Loader color="orange" size="xl" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md" pt="xl">
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Failed to Load Data"
          color="red"
          variant="filled"
        >
          There was an error fetching the product list: {error}
        </Alert>
      </Container>
    );
  }

  const rows = products.map((product) => (
    <Table.Tr key={product.id}>
      <Table.Td>{product.identifier}</Table.Td>
      <Table.Td>{product.name}</Table.Td>
      <Table.Td style={{ textAlign: "center" }}>{product.quantity}</Table.Td>
      <Table.Td>{product.location || "N/A"}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" py="xl">
      <Title order={1} c="orange.7" mb="xl">
        Product Inventory
      </Title>

      <Paper withBorder shadow="md" p="md" radius="md">
        {products.length > 0 ? (
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Identifier/SKU</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Quantity</Table.Th>
                <Table.Th>Location</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No products found. Start by adding a new product!
          </Text>
        )}
      </Paper>
    </Container>
  );
}
