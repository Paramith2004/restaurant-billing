package com.resturant.billing.controller;

import com.resturant.billing.model.User;
import com.resturant.billing.repository.UserRepository;
import com.resturant.billing.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String name = body.get("name");
        String role = body.getOrDefault("role", "staff");

        // Prevent registering as admin from frontend
        if (role.equals("admin")) {
            return ResponseEntity.badRequest().body("Cannot register as admin!");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists!");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body("Wrong password!");
        }

        String token = jwtUtil.generateToken(email);
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }

    // GET all users — Admin & Owner only
    @GetMapping("/staff")
    public ResponseEntity<?> getAllStaff() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // DELETE user — Admin & Owner only
    @DeleteMapping("/staff/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted!");
    }

    // UPDATE user role — Admin only
    @PutMapping("/staff/{id}/role")
    public ResponseEntity<?> updateRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id).orElseThrow();
        user.setRole(body.get("role"));
        userRepository.save(user);
        return ResponseEntity.ok("Role updated!");
    }
}