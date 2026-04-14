import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmployeeService from '../service/EmployeeService';
import PerformanceService from '../service/PerformanceService';

const ListEmployeeComponent = () => {
    const [employeeArray, setEmployeeArray] = useState([]);
    const [showBatchImport, setShowBatchImport] = useState(false);
    const [batchJson, setBatchJson] = useState('');
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        getAllEmployee();
    }, []);

    function getAllEmployee() {
        EmployeeService.getAllEmployee()
            .then(res => { setEmployeeArray(res.data); console.log(res) })
            .catch(e => console.log(e));
    }

    function deleteEmployee(e, id) {
        e.preventDefault()
        EmployeeService.deleteEmployee(id).then(getAllEmployee()).catch(e => console.log(e));
    }

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
                employee: { id: 1 },
                quarter: 1,
                year: 2024,
                score: 8,
                comment: "Excellent performance"
            },
            {
                employee: { id: 1 },
                quarter: 2,
                year: 2024,
                score: 7,
                comment: "Good work"
            },
            {
                employee: { id: 2 },
                quarter: 1,
                year: 2024,
                score: 9,
                comment: "Outstanding"
            }
        ];
        setBatchJson(JSON.stringify(sample, null, 2));
    };

    return (
        <div className='container'>
            <div className='d-flex justify-content-between align-items-center mb-2 mt-3'>
                <div>
                    <Link to={"/add-employee"} className='btn btn-primary me-2'>Add Employee</Link>
                    <button 
                        className='btn btn-success'
                        onClick={() => setShowBatchImport(!showBatchImport)}
                    >
                        {showBatchImport ? 'Cancel' : '📥 Batch Import Performance'}
                    </button>
                </div>
            </div>

            {showBatchImport && (
                <div className='card mb-4 bg-light'>
                    <div className='card-body'>
                        <h5 className='card-title'>Batch Import Performance Data</h5>
                        <p className='text-muted small'>
                            Enter a JSON array of performance records. Each record should include: 
                            employee.id, quarter (1-4), year, score (1-10), and optional comment.
                            <br />
                            <strong>Note:</strong> This operation uses database transactions. If any record fails, all changes will be rolled back.
                        </p>
                        <div className='mb-2'>
                            <button 
                                type='button' 
                                className='btn btn-sm btn-outline-secondary'
                                onClick={getSampleJson}
                            >
                                Load Sample Data
                            </button>
                        </div>
                        <form onSubmit={handleBatchImport}>
                            <div className='mb-3'>
                                <textarea 
                                    className='form-control font-monospace'
                                    rows={10}
                                    value={batchJson}
                                    onChange={(e) => setBatchJson(e.target.value)}
                                    placeholder={`[
  {
    "employee": { "id": 1 },
    "quarter": 1,
    "year": 2024,
    "score": 8,
    "comment": "Excellent performance"
  }
]`}
                                />
                            </div>
                            <button 
                                type='submit' 
                                className='btn btn-success'
                                disabled={importing}
                            >
                                {importing ? (
                                    <>
                                        <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                                        Importing...
                                    </>
                                ) : 'Import Performance Data'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <h2 className='text-center mb-4'>List Employee</h2>
            <table className='table table-bordered table striped'>
                <thead>
                    <th>Employee ID</th>
                    <th>Employee First Name</th>
                    <th>Employee Last Name</th>
                    <th>Employee Email</th>
                    <th>Actions</th>
                </thead>
                <tbody>
                    {employeeArray.map(employee =>
                        <tr id={employee.id}>
                            <td>{employee.id}</td>
                            <td>{employee.firstName}</td>
                            <td>{employee.lastName}</td>
                            <td>{employee.email}</td>
                            <td>
                                <Link to={`/employee-detail/${employee.id}`} className='btn btn-primary btn-sm'>View</Link> {" "}
                                <Link to={`/add-employee/${employee.id}`} className='btn btn-info btn-sm'>Update</Link> {" "}
                                <a onClick={(e) => deleteEmployee(e, employee.id)} className='btn btn-danger btn-sm'>Delete</a>
                            </td>
                        </tr>)}

                </tbody>
            </table>
        </div>
    )
}

export default ListEmployeeComponent
