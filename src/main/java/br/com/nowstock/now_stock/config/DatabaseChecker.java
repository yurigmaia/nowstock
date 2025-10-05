package br.com.nowstock.now_stock.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
public class DatabaseChecker {

    @Autowired
    private DataSource dataSource;

    @PostConstruct
    public void checkConnection() {
        try (Connection conn = dataSource.getConnection()) {
            if (conn != null && !conn.isClosed()) {
                System.out.println("Conexão com o banco de dados estabelecida com sucesso!");
            }
        } catch (Exception e) {
            System.err.println("Erro ao conectar no banco de dados: " + e.getMessage());
        }
    }
}

