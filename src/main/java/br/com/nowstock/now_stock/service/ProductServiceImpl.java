package br.com.nowstock.now_stock.service;

import br.com.nowstock.now_stock.dto.CreateProductRequest;
import br.com.nowstock.now_stock.dto.ProductDTO;
import br.com.nowstock.now_stock.entity.Product;
import br.com.nowstock.now_stock.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @Transactional
    public ProductDTO createProduct(CreateProductRequest request) {

        Product newProduct = new Product();
        newProduct.setTagId(request.getTagId());
        newProduct.setIdentifier(request.getIdentifier());
        newProduct.setName(request.getName());
        newProduct.setDescription(request.getDescription());
        newProduct.setQuantity(request.getQuantity());
        newProduct.setLocation(request.getLocation());

        Product savedProduct = productRepository.save(newProduct);

        return toDTO(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> findAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO findProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        return toDTO(product);
    }

    private ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setTagId(product.getTagId());
        dto.setIdentifier(product.getIdentifier());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setQuantity(product.getQuantity());
        dto.setLocation(product.getLocation());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        return dto;
    }
}