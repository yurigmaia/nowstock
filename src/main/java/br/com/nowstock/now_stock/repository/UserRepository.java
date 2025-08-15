package br.com.nowstock.now_stock.repository;

import br.com.nowstock.now_stock.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}