package com.tutorial.employeemanagmentbackend.controller;

import com.tutorial.employeemanagmentbackend.model.Performance;
import com.tutorial.employeemanagmentbackend.service.PerformanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/performance")
@CrossOrigin("*")
public class PerformanceController {

    @Autowired
    private PerformanceService performanceService;

    @PostMapping
    public ResponseEntity<?> savePerformance(@RequestBody Performance performance) {
        try {
            Performance savedPerformance = performanceService.savePerformance(performance);
            return ResponseEntity.ok(savedPerformance);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Performance> getPerformanceById(@PathVariable int id) {
        Optional<Performance> performance = performanceService.getPerformanceById(id);
        return performance.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Performance>> getPerformanceByEmployeeId(@PathVariable int employeeId) {
        List<Performance> performances = performanceService.getPerformanceByEmployeeId(employeeId);
        return ResponseEntity.ok(performances);
    }

    @GetMapping("/employee/{employeeId}/quarter/{quarter}/year/{year}")
    public ResponseEntity<Performance> getPerformanceByEmployeeIdAndQuarterAndYear(
            @PathVariable int employeeId,
            @PathVariable int quarter,
            @PathVariable int year) {
        Optional<Performance> performance = performanceService
                .getPerformanceByEmployeeIdAndQuarterAndYear(employeeId, quarter, year);
        return performance.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePerformance(@PathVariable int id, @RequestBody Performance performance) {
        try {
            Performance updatedPerformance = performanceService.updatePerformance(id, performance);
            return ResponseEntity.ok(updatedPerformance);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerformance(@PathVariable int id) {
        performanceService.deletePerformance(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employee/{employeeId}/statistics")
    public ResponseEntity<Map<String, Object>> getPerformanceStatistics(@PathVariable int employeeId) {
        Map<String, Object> statistics = performanceService.getPerformanceStatistics(employeeId);
        return ResponseEntity.ok(statistics);
    }

    @PostMapping("/batch")
    public ResponseEntity<?> batchImportPerformances(@RequestBody List<Performance> performances) {
        try {
            List<Performance> savedPerformances = performanceService.batchImportPerformances(performances);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Successfully imported " + savedPerformances.size() + " performance records");
            result.put("records", savedPerformances);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Batch import failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
