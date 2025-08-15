package br.com.nowstock.now_stock.repository;

import br.com.nowstock.now_stock.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}