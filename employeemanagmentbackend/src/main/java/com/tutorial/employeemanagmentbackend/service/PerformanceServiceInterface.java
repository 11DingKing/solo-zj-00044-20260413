package com.tutorial.employeemanagmentbackend.service;

import com.tutorial.employeemanagmentbackend.model.Performance;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface PerformanceServiceInterface {

    Performance savePerformance(Performance performance);

    Optional<Performance> getPerformanceById(int id);

    List<Performance> getPerformanceByEmployeeId(int employeeId);

    Optional<Performance> getPerformanceByEmployeeIdAndQuarterAndYear(int employeeId, int quarter, int year);

    Performance updatePerformance(int id, Performance performance);

    void deletePerformance(int id);

    Map<String, Object> getPerformanceStatistics(int employeeId);

    List<Performance> batchImportPerformances(List<Performance> performances);
}
