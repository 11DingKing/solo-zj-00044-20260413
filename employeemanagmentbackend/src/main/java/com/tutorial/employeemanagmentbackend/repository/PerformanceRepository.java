package com.tutorial.employeemanagmentbackend.repository;

import com.tutorial.employeemanagmentbackend.model.Employee;
import com.tutorial.employeemanagmentbackend.model.Performance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceRepository extends JpaRepository<Performance, Integer> {

    Optional<Performance> findByEmployeeAndQuarterAndYear(Employee employee, int quarter, int year);

    List<Performance> findByEmployeeOrderByYearDescQuarterDesc(Employee employee);

    List<Performance> findByEmployeeIdOrderByYearDescQuarterDesc(int employeeId);

    @Query("SELECT AVG(p.score) FROM Performance p WHERE p.employee.id = :employeeId")
    Double findAverageScoreByEmployeeId(@Param("employeeId") int employeeId);

    @Query("SELECT MAX(p.score) FROM Performance p WHERE p.employee.id = :employeeId")
    Integer findMaxScoreByEmployeeId(@Param("employeeId") int employeeId);

    @Query("SELECT MIN(p.score) FROM Performance p WHERE p.employee.id = :employeeId")
    Integer findMinScoreByEmployeeId(@Param("employeeId") int employeeId);

    @Query("SELECT COUNT(p) FROM Performance p WHERE p.employee.id = :employeeId")
    Long countByEmployeeId(@Param("employeeId") int employeeId);

    boolean existsByEmployeeAndQuarterAndYear(Employee employee, int quarter, int year);
}
