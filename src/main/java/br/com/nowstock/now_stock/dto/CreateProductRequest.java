package br.com.nowstock.now_stock.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateProductRequest {

    @NotBlank(message = "Tag ID cannot be blank.")
    private String tagId;

    @NotBlank(message = "Identifier cannot be blank.")
    private String identifier;

    @NotBlank(message = "Name cannot be blank.")
    @Size(min = 3, max = 255, message = "Name must be between 3 and 255 characters.")
    private String name;

    private String description;

    @Min(value = 0, message = "Quantity cannot be negative.")
    private int quantity;

    private String location;
}