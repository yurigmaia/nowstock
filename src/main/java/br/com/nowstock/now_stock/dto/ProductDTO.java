package br.com.nowstock.now_stock.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProductDTO {
    private Long id;
    private String tagId;
    private String identifier;
    private String name;
    private String description;
    private int quantity;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}