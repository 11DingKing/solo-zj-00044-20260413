package com.tutorial.employeemanagmentbackend.service;

import com.tutorial.employeemanagmentbackend.model.Employee;
import com.tutorial.employeemanagmentbackend.model.Performance;
import com.tutorial.employeemanagmentbackend.repository.EmployeeRepository;
import com.tutorial.employeemanagmentbackend.repository.PerformanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PerformanceService implements PerformanceServiceInterface {

    @Autowired
    private PerformanceRepository performanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public Performance savePerformance(Performance performance) {
        if (performance.getScore() < 1 || performance.getScore() > 10) {
            throw new IllegalArgumentException("Score must be between 1 and 10");
        }
        if (performance.getQuarter() < 1 || performance.getQuarter() > 4) {
            throw new IllegalArgumentException("Quarter must be between 1 and 4");
        }

        Employee employee = employeeRepository.findById(performance.getEmployee().getId())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        Optional<Performance> existingPerformance = performanceRepository
                .findByEmployeeAndQuarterAndYear(employee, performance.getQuarter(), performance.getYear());

        if (existingPerformance.isPresent()) {
            Performance perfToUpdate = existingPerformance.get();
            perfToUpdate.setScore(performance.getScore());
            perfToUpdate.setComment(performance.getComment());
            return performanceRepository.save(perfToUpdate);
        } else {
            performance.setEmployee(employee);
            return performanceRepository.save(performance);
        }
    }

    @Override
    public Optional<Performance> getPerformanceById(int id) {
        return performanceRepository.findById(id);
    }

    @Override
    public List<Performance> getPerformanceByEmployeeId(int employeeId) {
        return performanceRepository.findByEmployeeIdOrderByYearDescQuarterDesc(employeeId);
    }

    @Override
    public Optional<Performance> getPerformanceByEmployeeIdAndQuarterAndYear(int employeeId, int quarter, int year) {
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return Optional.empty();
        }
        return performanceRepository.findByEmployeeAndQuarterAndYear(employee, quarter, year);
    }

    @Override
    @Transactional
    public Performance updatePerformance(int id, Performance performance) {
        Performance perfToUpdate = performanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Performance not found"));

        if (performance.getScore() < 1 || performance.getScore() > 10) {
            throw new IllegalArgumentException("Score must be between 1 and 10");
        }

        perfToUpdate.setScore(performance.getScore());
        perfToUpdate.setComment(performance.getComment());

        return performanceRepository.save(perfToUpdate);
    }

    @Override
    @Transactional
    public void deletePerformance(int id) {
        performanceRepository.deleteById(id);
    }

    @Override
    public Map<String, Object> getPerformanceStatistics(int employeeId) {
        Map<String, Object> stats = new HashMap<>();
        
        Long count = performanceRepository.countByEmployeeId(employeeId);
        stats.put("totalRecords", count);
        
        if (count > 0) {
            Double avgScore = performanceRepository.findAverageScoreByEmployeeId(employeeId);
            Integer maxScore = performanceRepository.findMaxScoreByEmployeeId(employeeId);
            Integer minScore = performanceRepository.findMinScoreByEmployeeId(employeeId);
            
            stats.put("averageScore", avgScore != null ? Math.round(avgScore * 100.0) / 100.0 : null);
            stats.put("maxScore", maxScore);
            stats.put("minScore", minScore);
        } else {
            stats.put("averageScore", null);
            stats.put("maxScore", null);
            stats.put("minScore", null);
        }
        
        return stats;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<Performance> batchImportPerformances(List<Performance> performances) {
        List<Performance> savedPerformances = new ArrayList<>();
        
        for (Performance performance : performances) {
            if (performance.getScore() < 1 || performance.getScore() > 10) {
                throw new IllegalArgumentException("Score must be between 1 and 10 for employee ID: " 
                    + (performance.getEmployee() != null ? performance.getEmployee().getId() : "unknown"));
            }
            if (performance.getQuarter() < 1 || performance.getQuarter() > 4) {
                throw new IllegalArgumentException("Quarter must be between 1 and 4 for employee ID: " 
                    + (performance.getEmployee() != null ? performance.getEmployee().getId() : "unknown"));
            }
            
            Employee employee = employeeRepository.findById(performance.getEmployee().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " 
                        + performance.getEmployee().getId()));
            
            Optional<Performance> existingPerformance = performanceRepository
                    .findByEmployeeAndQuarterAndYear(employee, performance.getQuarter(), performance.getYear());
            
            if (existingPerformance.isPresent()) {
                Performance perfToUpdate = existingPerformance.get();
                perfToUpdate.setScore(performance.getScore());
                perfToUpdate.setComment(performance.getComment());
                savedPerformances.add(performanceRepository.save(perfToUpdate));
            } else {
                performance.setEmployee(employee);
                savedPerformances.add(performanceRepository.save(performance));
            }
        }
        
        return savedPerformances;
    }
}
