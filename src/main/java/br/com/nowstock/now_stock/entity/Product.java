package br.com.nowstock.now_stock.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tag_id", nullable = false, unique = true)
    private String tagId;

    @Column(name = "identifier", nullable = false, unique = true)
    private String identifier;

    @Column(nullable = false)
    private String name;

    @Column(length = 1024)
    private String description;

    private int quantity;

    private String location;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}