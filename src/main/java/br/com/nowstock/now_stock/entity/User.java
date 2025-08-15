package br.com.nowstock.now_stock.entity;

import br.com.nowstock.now_stock.entity.enums.UserRole;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password; // This will be stored hashed!

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
}