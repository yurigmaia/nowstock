// br/com/nowstock/now_stock/controller/ProductController.java
package br.com.nowstock.now_stock.controller;

import br.com.nowstock.now_stock.dto.ProductDTO;
import br.com.nowstock.now_stock.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController // VERY IMPORTANT: Indicates this controller returns JSON, not HTML.
@RequestMapping("/api/products") // All endpoints in this class will start with /api/products
@RequiredArgsConstructor
// Allow requests from our React app (which will run on localhost:3000 or similar)
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productService.findAllProducts();
        return ResponseEntity.ok(products);
    }

    // We will add POST, GET by ID, PUT, and DELETE endpoints here later.
}