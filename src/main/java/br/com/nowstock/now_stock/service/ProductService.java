package br.com.nowstock.now_stock.service;

import br.com.nowstock.now_stock.dto.CreateProductRequest;
import br.com.nowstock.now_stock.dto.ProductDTO;
import java.util.List;

public interface ProductService {

    ProductDTO createProduct(CreateProductRequest createProductRequest);

   List<ProductDTO> findAllProducts();

    ProductDTO findProductById(Long id);

}