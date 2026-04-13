import axios from "axios";

const BASE_URL = "http://localhost:8080/performance";

class PerformanceService {

    savePerformance(performanceData) {
        return axios.post(BASE_URL, performanceData);
    }

    getPerformanceById(id) {
        return axios.get(`${BASE_URL}/${id}`);
    }

    getPerformanceByEmployeeId(employeeId) {
        return axios.get(`${BASE_URL}/employee/${employeeId}`);
    }

    getPerformanceByEmployeeIdAndQuarterAndYear(employeeId, quarter, year) {
        return axios.get(`${BASE_URL}/employee/${employeeId}/quarter/${quarter}/year/${year}`);
    }

    updatePerformance(id, performanceData) {
        return axios.put(`${BASE_URL}/${id}`, performanceData);
    }

    deletePerformance(id) {
        return axios.delete(`${BASE_URL}/${id}`);
    }

    getPerformanceStatistics(employeeId) {
        return axios.get(`${BASE_URL}/employee/${employeeId}/statistics`);
    }

    batchImportPerformances(performances) {
        return axios.post(`${BASE_URL}/batch`, performances);
    }
}

export default new PerformanceService();
