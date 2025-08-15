package br.com.nowstock.now_stock.repository;

import br.com.nowstock.now_stock.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
}