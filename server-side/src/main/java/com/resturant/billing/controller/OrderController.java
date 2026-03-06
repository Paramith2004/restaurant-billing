package com.resturant.billing.controller;

import com.resturant.billing.model.Order;
import com.resturant.billing.model.OrderItem;
import com.resturant.billing.model.Customer;
import com.resturant.billing.model.MenuItem;
import com.resturant.billing.repository.OrderRepository;
import com.resturant.billing.repository.CustomerRepository;
import com.resturant.billing.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @GetMapping
    public List<Order> getAll() {
        List<Order> orders = orderRepository.findAll();
        Collections.reverse(orders);
        return orders;
    }

    @GetMapping("/{id}")
    public Order getById(@PathVariable Long id) {
        return orderRepository.findById(id).orElseThrow();
    }

    @PostMapping
    public Order createOrder(@RequestBody Map<String, Object> body) {

        Long customerId = Long.valueOf(body.get("customerId").toString());
        Customer customer = customerRepository.findById(customerId).orElseThrow();

        Integer tableNumber = (Integer) body.get("tableNumber");
        String paymentMethod = (String) body.get("paymentMethod");
        String orderType = (String) body.getOrDefault("orderType", "dine-in");
        Double discount = Double.valueOf(body.get("discount").toString());
        Double serviceCharge = Double.valueOf(body.getOrDefault("serviceCharge", 0).toString());

        List<Map<String, Object>> itemsData =
                (List<Map<String, Object>>) body.get("items");

        Order order = new Order();
        order.setCustomer(customer);
        order.setTableNumber(tableNumber);
        order.setPaymentMethod(paymentMethod);
        order.setDiscount(discount);
        order.setStatus("paid");

        List<OrderItem> orderItems = new ArrayList<>();
        double subtotal = 0;

        for (Map<String, Object> itemData : itemsData) {
            Long menuItemId = Long.valueOf(itemData.get("menuItemId").toString());
            Integer quantity = (Integer) itemData.get("quantity");
            MenuItem menuItem = menuItemRepository.findById(menuItemId).orElseThrow();

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(menuItem.getPrice());
            orderItem.setTotalPrice(menuItem.getPrice() * quantity);

            orderItems.add(orderItem);
            subtotal += orderItem.getTotalPrice();
        }

        // Sri Lankan system:
        // Dine In → service charge (custom amount)
        // Take Away → no service charge, no tax
        double tax = orderType.equals("dine-in") ? serviceCharge : 0;

        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setTotal(subtotal + tax - discount);
        order.setItems(orderItems);

        return orderRepository.save(order);
    }

    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orderRepository.deleteById(id);
    }
}