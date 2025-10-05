package br.com.nowstock.now_stock.service;

import br.com.nowstock.now_stock.dto.LoginRequest;
import br.com.nowstock.now_stock.dto.RegisterRequest;
import br.com.nowstock.now_stock.entity.Empresa;
import br.com.nowstock.now_stock.entity.User;
import br.com.nowstock.now_stock.entity.enums.NivelAcesso;
import br.com.nowstock.now_stock.repository.EmpresaRepository;
import br.com.nowstock.now_stock.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EmpresaRepository empresaRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("E-mail já cadastrado!");
        }

        Empresa empresa = empresaRepository.findById(request.getIdEmpresa())
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada."));

        User newUser = new User();
        newUser.setEmpresa(empresa);
        newUser.setNome(request.getNome());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setNivelAcesso(NivelAcesso.OPERADOR);
        newUser.setDataCadastro(LocalDateTime.now());
        newUser.setStatus("ativo");

        return userRepository.save(newUser);
    }

    public String login(LoginRequest request) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
        this.authenticationManager.authenticate(usernamePassword);

        return "Login bem-sucedido";
    }
}


