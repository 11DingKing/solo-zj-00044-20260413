import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import EmployeeService from '../service/EmployeeService';
import PerformanceService from '../service/PerformanceService';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const EmployeeDetailComponent = () => {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [performances, setPerformances] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [showAddPerformance, setShowAddPerformance] = useState(false);
    const [showBatchImport, setShowBatchImport] = useState(false);
    const [quarter, setQuarter] = useState(1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [score, setScore] = useState(5);
    const [comment, setComment] = useState('');
    const [batchJson, setBatchJson] = useState('');
    const [importing, setImporting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadEmployeeData();
        }
    }, [id]);

    const loadEmployeeData = () => {
        setLoading(true);
        Promise.all([
            EmployeeService.getEmployeeById(id),
            PerformanceService.getPerformanceByEmployeeId(id),
            PerformanceService.getPerformanceStatistics(id)
        ]).then(([empRes, perfRes, statsRes]) => {
            setEmployee(empRes.data);
            setPerformances(perfRes.data);
            setStatistics(statsRes.data);
            setLoading(false);
        }).catch(e => {
            console.log(e);
            setLoading(false);
        });
    };

    const handleAddPerformance = (e) => {
        e.preventDefault();
        
        const performanceData = {
            employee: { id: parseInt(id) },
            quarter: parseInt(quarter),
            year: parseInt(year),
            score: parseInt(score),
            comment: comment
        };

        PerformanceService.savePerformance(performanceData)
            .then(() => {
                setShowAddPerformance(false);
                setQuarter(1);
                setYear(new Date().getFullYear());
                setScore(5);
                setComment('');
                loadEmployeeData();
            })
            .catch(e => {
                console.log(e);
                alert(e.response?.data?.error || 'Failed to save performance');
            });
    };

    const handleBatchImport = (e) => {
        e.preventDefault();
        
        if (!batchJson.trim()) {
            alert('Please enter JSON data');
            return;
        }

        let performances;
        try {
            performances = JSON.parse(batchJson);
            if (!Array.isArray(performances)) {
                throw new Error('Data must be an array');
            }
            performances = performances.map(p => ({
                ...p,
                employee: { id: parseInt(id) }
            }));
        } catch (error) {
            alert('Invalid JSON format: ' + error.message);
            return;
        }

        setImporting(true);
        PerformanceService.batchImportPerformances(performances)
            .then(res => {
                alert(res.data.message || 'Import successful!');
                setBatchJson('');
                setShowBatchImport(false);
                loadEmployeeData();
            })
            .catch(e => {
                console.log(e);
                alert(e.response?.data?.error || 'Import failed');
            })
            .finally(() => {
                setImporting(false);
            });
    };

    const getSampleJson = () => {
        const sample = [
            {
                quarter: 1,
                year: 2024,
                score: 8,
                comment: "Excellent performance"
            },
            {
                quarter: 2,
                year: 2024,
                score: 7,
                comment: "Good work"
            },
            {
                quarter: 3,
                year: 2024,
                score: 9,
                comment: "Outstanding"
            }
        ];
        setBatchJson(JSON.stringify(sample, null, 2));
    };

    const getChartData = () => {
        const sortedPerformances = [...performances].sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.quarter - b.quarter;
        });

        const labels = sortedPerformances.map(p => `${p.year} Q${p.quarter}`);
        const scores = sortedPerformances.map(p => p.score);

        return {
            labels,
            datasets: [
                {
                    label: 'Performance Score',
                    data: scores,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    tension: 0.3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Performance History',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const index = context.dataIndex;
                        const performance = performances[index];
                        return [
                            `Score: ${context.parsed.y}/10`,
                            performance.comment ? `Comment: ${performance.comment}` : ''
                        ].filter(Boolean);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                ticks: {
                    stepSize: 1
                },
                title: {
                    display: true,
                    text: 'Score (1-10)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Quarter'
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">Employee not found</div>
                <Link to="/employee" className="btn btn-primary">Back to Employee List</Link>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row mb-4">
                <div className="col">
                    <Link to="/employee" className="btn btn-secondary">
                        ← Back to Employee List
                    </Link>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">Employee Details</h4>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <p><strong>ID:</strong> {employee.id}</p>
                            <p><strong>First Name:</strong> {employee.firstName}</p>
                            <p><strong>Last Name:</strong> {employee.lastName}</p>
                            <p><strong>Email:</strong> {employee.email}</p>
                        </div>
                        <div className="col-md-6">
                            {statistics && statistics.totalRecords > 0 && (
                                <div className="card bg-light">
                                    <div className="card-body">
                                        <h5 className="card-title">Performance Statistics</h5>
                                        <div className="row">
                                            <div className="col-4 text-center">
                                                <div className="h3 text-primary">{statistics.averageScore}</div>
                                                <small className="text-muted">Average</small>
                                            </div>
                                            <div className="col-4 text-center">
                                                <div className="h3 text-success">{statistics.maxScore}</div>
                                                <small className="text-muted">Highest</small>
                                            </div>
                                            <div className="col-4 text-center">
                                                <div className="h3 text-warning">{statistics.minScore}</div>
                                                <small className="text-muted">Lowest</small>
                                            </div>
                                        </div>
                                        <p className="mt-2 mb-0 text-center text-muted">
                                            Total Records: {statistics.totalRecords}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Performance History</h5>
                    <div>
                        <button 
                            className="btn btn-success btn-sm me-2"
                            onClick={() => {
                                setShowBatchImport(!showBatchImport);
                                setShowAddPerformance(false);
                            }}
                        >
                            {showBatchImport ? 'Cancel' : '📥 Batch Import'}
                        </button>
                        <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                setShowAddPerformance(!showAddPerformance);
                                setShowBatchImport(false);
                            }}
                        >
                            {showAddPerformance ? 'Cancel' : '+ Add Single'}
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {showAddPerformance && (
                        <div className="card mb-4 bg-light">
                            <div className="card-body">
                                <h6 className="card-title">Add/Update Single Performance</h6>
                                <form onSubmit={handleAddPerformance}>
                                    <div className="row">
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Quarter</label>
                                            <select 
                                                className="form-control"
                                                value={quarter}
                                                onChange={(e) => setQuarter(e.target.value)}
                                            >
                                                <option value={1}>Q1</option>
                                                <option value={2}>Q2</option>
                                                <option value={3}>Q3</option>
                                                <option value={4}>Q4</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Year</label>
                                            <input 
                                                type="number"
                                                className="form-control"
                                                value={year}
                                                onChange={(e) => setYear(e.target.value)}
                                                min="2000"
                                                max="2100"
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Score (1-10)</label>
                                            <input 
                                                type="number"
                                                className="form-control"
                                                value={score}
                                                onChange={(e) => setScore(e.target.value)}
                                                min="1"
                                                max="10"
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Comment</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Optional comment"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-success">
                                        Save Performance
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {showBatchImport && (
                        <div className="card mb-4 bg-light">
                            <div className="card-body">
                                <h6 className="card-title">Batch Import Performance Data (for this employee)</h6>
                                <p className="text-muted small">
                                    Enter a JSON array of performance records. Each record should include: 
                                    quarter (1-4), year, score (1-10), and optional comment.
                                    <br />
                                    <strong>Note:</strong> Employee ID will be automatically set to current employee ({employee.firstName} {employee.lastName}).
                                    This operation uses database transactions. If any record fails, all changes will be rolled back.
                                </p>
                                <div className="mb-2">
                                    <button 
                                        type="button" 
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={getSampleJson}
                                    >
                                        Load Sample Data
                                    </button>
                                </div>
                                <form onSubmit={handleBatchImport}>
                                    <div className="mb-3">
                                        <textarea 
                                            className="form-control font-monospace"
                                            rows={8}
                                            value={batchJson}
                                            onChange={(e) => setBatchJson(e.target.value)}
                                            placeholder={`[
  {
    "quarter": 1,
    "year": 2024,
    "score": 8,
    "comment": "Excellent performance"
  }
]`}
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="btn btn-success"
                                        disabled={importing}
                                    >
                                        {importing ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Importing...
                                            </>
                                        ) : 'Import Performance Data'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {performances.length > 0 ? (
                        <>
                            <div style={{ height: '300px', marginBottom: '20px' }}>
                                <Line data={getChartData()} options={chartOptions} />
                            </div>

                            <h6 className="mt-4">Performance Records</h6>
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Year</th>
                                            <th>Quarter</th>
                                            <th>Score</th>
                                            <th>Comment</th>
                                            <th>Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {performances.map(perf => (
                                            <tr key={perf.id}>
                                                <td>{perf.year}</td>
                                                <td>Q{perf.quarter}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        perf.score >= 8 ? 'bg-success' :
                                                        perf.score >= 5 ? 'bg-warning' : 'bg-danger'
                                                    }`}>
                                                        {perf.score}/10
                                                    </span>
                                                </td>
                                                <td>{perf.comment || '-'}</td>
                                                <td>{new Date(perf.updatedAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <p>No performance records found for this employee.</p>
                            <p>Click "Add Single" or "Batch Import" to create records.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailComponent;
