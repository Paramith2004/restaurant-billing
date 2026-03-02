package com.resturant.billing.controller;

import com.resturant.billing.repository.OrderRepository;
import com.resturant.billing.repository.MenuItemRepository;
import com.resturant.billing.repository.CustomerRepository;
import com.resturant.billing.model.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    // GET overall summary
    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        List<Order> orders = orderRepository.findAll();

        double totalRevenue = orders.stream()
                .mapToDouble(Order::getTotal)
                .sum();

        double totalTax = orders.stream()
                .mapToDouble(Order::getTax)
                .sum();

        double totalDiscount = orders.stream()
                .mapToDouble(Order::getDiscount)
                .sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalOrders", orders.size());
        summary.put("totalRevenue", totalRevenue);
        summary.put("totalTax", totalTax);
        summary.put("totalDiscount", totalDiscount);
        summary.put("totalMenuItems", menuItemRepository.count());
        summary.put("totalCustomers", customerRepository.count());

        return summary;
    }

    // GET recent orders
    @GetMapping("/recent-orders")
    public List<Order> getRecentOrders() {
        List<Order> orders = orderRepository.findAll();
        // Return last 5 orders
        int size = orders.size();
        return orders.subList(Math.max(0, size - 5), size);
    }

    // GET payment method breakdown
    @GetMapping("/payment-methods")
    public Map<String, Long> getPaymentMethods() {
        List<Order> orders = orderRepository.findAll();
        Map<String, Long> breakdown = new HashMap<>();

        for (Order order : orders) {
            String method = order.getPaymentMethod();
            breakdown.put(method, breakdown.getOrDefault(method, 0L) + 1);
        }
        return breakdown;
    }
}