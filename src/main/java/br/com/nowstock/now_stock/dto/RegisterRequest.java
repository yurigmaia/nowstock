package br.com.nowstock.now_stock.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String nome;
    private String email;
    private String password;
    private Integer idEmpresa;
}

